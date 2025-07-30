from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Snapshot, SystemInfo, User, PasswordStatus, NetworkInfo, SuspiciousIP, FileAnalysis, LogEntry, Package, SuspiciousPackage, AttackLog, LoginEvent
import json
from datetime import datetime
from sqlalchemy import func
import re

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///forensic.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def index():
    return "Serverul Forensics este online"

@app.route('/api/forensic-data', methods=['POST'])
def receive_full_forensic_data():
    data = request.json
    intro = data.get("intro", {})
    system = data.get("system_info", {})
    user_info = data.get("user_info", {})
    network = data.get("network_info", {})
    file_info = data.get("file_info", {})
    logs = data.get("log_info", {})

    disk = system.get("disk", {})
    ram = system.get("ram", {})

    snapshot = Snapshot(
        hostname=intro.get("hostname"),
        ip=intro.get("ip")
    )
    db.session.add(snapshot)
    db.session.flush()

    sysinfo = SystemInfo(
        snapshot_id=snapshot.id,
        mac=system.get("mac"),
        distro=system.get("distro"),
        kernel=system.get("kernel"),
        arch=system.get("arch"),
        install_date=system.get("install_date"),
        cpu=system.get("cpu"),
        model=system.get("model"),
        serial=system.get("serial"),
        uptime=system.get("uptime"),
        mounted_devices=system.get("mounted_devices"),
        ports=json.dumps(system.get("ports", [])),
        disk_total=disk.get("total"),
        disk_used=disk.get("used"),
        disk_available=disk.get("available"),
        ram_total=ram.get("total"),
        ram_used=ram.get("used"),
        ram_free=ram.get("free")
    )
    db.session.add(sysinfo)

    for u in user_info.get("users", []):
        db.session.add(User(
            snapshot_id=snapshot.id,
            username=u.get("username"),
            uid=u.get("uid"),
            gid=u.get("gid"),
            home=u.get("home"),
            shell=u.get("shell"),
            groups=u.get("groups"),
            active_now=u.get("active_now"),
            last_login=u.get("last_login"),
            processes=json.dumps(u.get("processes", [])),
            recent_commands=json.dumps(u.get("recent_commands", []))
        ))

    for line in user_info.get("login_history", []):
        parts = line.split()
        if len(parts) >= 10:
            db.session.add(LoginEvent(
                snapshot_id=snapshot.id,
                username=parts[0],
                terminal=parts[1],
                ip=parts[2] if re.match(r'\d+\.\d+\.\d+\.\d+', parts[2]) else '-',
                start=" ".join(parts[3:8]),
                duration=parts[-1].strip("()")
            ))


    for username, info in user_info.get("cracked_passwords", {}).items():
        db.session.add(PasswordStatus(
            snapshot_id=snapshot.id,
            username=username,
            status=info.get("status"),
            cracked_password=info.get("parola")
        ))

    db.session.add(NetworkInfo(
        snapshot_id=snapshot.id,
        firewall=json.dumps(network.get("firewall")),
        gateway=network.get("gateway"),
        dns=json.dumps(network.get("dns", [])),
        active_connections=json.dumps(network.get("active_connections", [])),
        captured_traffic=json.dumps(network.get("captured_traffic", []))
    ))

    for ip in network.get("suspect_ips", []):
        db.session.add(SuspiciousIP(
            snapshot_id=snapshot.id,
            ip=ip.get("ip"),
            country=ip.get("country"),
            hostname=ip.get("hostname"),
            org=ip.get("org"),
            loc=ip.get("loc"),
            abuse_score=ip.get("abuse_score")
        ))

    for f in file_info.get("fis_suspecte", []):
        db.session.add(FileAnalysis(
            snapshot_id=snapshot.id,
            path=f.get("path"),
            size=f.get("size"),
            sha256=f.get("sha256"),
            flags=json.dumps(f.get("flags", [])),
            scanned_at=datetime.fromisoformat(f.get("scanned_at"))
    ))


    for log_category in ["auth_logs", "system_logs"]:
        for l in logs.get(log_category, []):
            db.session.add(LogEntry(
                snapshot_id=snapshot.id,
                timestamp=l.get("timp", "-"),
                service=log_category,
                message=l.get("mesaj", l if isinstance(l, str) else "-")
            ))


# Atacuri brute-force si web în AttackLog
    for l in logs.get("brute_force", []):
        db.session.add(AttackLog(
            snapshot_id=snapshot.id,
            timestamp=l.get("timp"),
            service=l.get("serviciu"),
            message=l.get("mesaj"),
            ip=l.get("ip"),
            username=l.get("user") or "-",
            port=l.get("port") or "-",
            attack_type="brute_force"
    ))


    for l in logs.get("web_attacks", []):
       db.session.add(AttackLog(
            snapshot_id=snapshot.id,
            timestamp=l.get("timp"),
            service=l.get("serviciu"),
            message=l.get("mesaj"),
            ip=l.get("ip"),
            method=l.get("method"),
            url=l.get("url"),
            attack_type=l.get("attack_type")
        ))



    for pkg in system.get("installed_packages", []):
        db.session.add(Package(
            snapshot_id=snapshot.id,
            name=pkg.get("name")
        ))


    for spkg in system.get("suspicious_packages", []):
        db.session.add(SuspiciousPackage(
            snapshot_id=snapshot.id,
            name=spkg.get("name")
        ))

    db.session.commit()

    print(f"[FORN] Salvat complet pentru: {snapshot.hostname}")
    return jsonify({"message": "Snapshot complet salvat"}), 200


# preluare date baza

@app.route('/api/snapshots')
def get_latest_snapshots():
    subquery = db.session.query(
        Snapshot.hostname,
        Snapshot.ip,
        func.max(Snapshot.timestamp).label("latest")
    ).group_by(Snapshot.hostname, Snapshot.ip).subquery()

    latest = db.session.query(Snapshot).join(
        subquery,
        (Snapshot.hostname == subquery.c.hostname) &
        (Snapshot.ip == subquery.c.ip) &
        (Snapshot.timestamp == subquery.c.latest)
    ).all()

    return jsonify([
        {
            "id": s.id,
            "hostname": s.hostname,
            "ip": s.ip,
            "timestamp": s.timestamp.isoformat()
        } for s in latest
    ])

@app.route('/api/snapshot/<int:id>/system')
def get_system_info(id):
    sysinfo = SystemInfo.query.filter_by(snapshot_id=id).first()
    if not sysinfo:
        return jsonify({"error": "No system info found"}), 404

    # Pachete normale suspecte
    installed_pkgs = Package.query.filter_by(snapshot_id=id).all()
    suspicious_pkgs = SuspiciousPackage.query.filter_by(snapshot_id=id).all()

    result = {
        "hostname": sysinfo.snapshot.hostname,
        "ip": sysinfo.snapshot.ip,
        "mac": sysinfo.mac,
        "distro": sysinfo.distro,
        "kernel": sysinfo.kernel,
        "install_date": sysinfo.install_date,
        "mounted_devices": sysinfo.mounted_devices,
        "model": sysinfo.model,
        "serial": sysinfo.serial,
        "uptime": sysinfo.uptime,
        "ports": json.loads(sysinfo.ports or "[]"),
        "cpu": sysinfo.cpu,
        "disk_total": sysinfo.disk_total,
        "disk_used": sysinfo.disk_used,
        "ram_total": sysinfo.ram_total,
        "ram_used": sysinfo.ram_used,

        "installed_packages": [{"name": p.name} for p in installed_pkgs],
        "suspicious_packages": [{"name": p.name} for p in suspicious_pkgs]
    }

    return jsonify(result)



@app.route('/api/snapshot/<int:id>/users')
def get_users(id):
    users = User.query.filter_by(snapshot_id=id).all()
    return jsonify([
    {
        "username": u.username,
        "uid": u.uid,
        "gid": u.gid,
        "home": u.home,
        "shell": u.shell,
        "groups": u.groups,
        "active_now": u.active_now,
        "last_login": u.last_login,
        "processes": json.loads(u.processes or "[]"),
        "recent_commands": json.loads(u.recent_commands or "[]")
    }
    for u in users
])


@app.route('/api/snapshot/<int:id>/passwords')
def get_passwords(id):
    rows = PasswordStatus.query.filter_by(snapshot_id=id).all()
    return jsonify([
        {
            "username": r.username,
            "status": r.status,
            "cracked_password": r.cracked_password
        } for r in rows
    ])


@app.route('/api/snapshot/<int:id>/network')
def get_network_info(id):
    net = NetworkInfo.query.filter_by(snapshot_id=id).first()
    if not net:
        return jsonify({}), 404

    return jsonify({
        "firewall": json.loads(net.firewall or "[]"),
        "gateway": net.gateway,
        "dns": json.loads(net.dns or "[]"),
        "active_connections": json.loads(net.active_connections or "[]"),
        "captured_traffic": json.loads(net.captured_traffic or "[]")
    })


@app.route('/api/snapshot/<int:id>/ips')
def get_suspect_ips(id):
    ips = SuspiciousIP.query.filter_by(snapshot_id=id).all()
    result = []
    for ip in ips:
        result.append({
            "id": ip.id,
            "ip": ip.ip,
            "country": ip.country,
            "hostname": ip.hostname,
            "org": ip.org,
            "loc": ip.loc,
            "abuse_score": ip.abuse_score
        })
    return jsonify(result)




@app.route('/api/snapshot/<int:id>/files')
def get_suspect_files(id):
    files = FileAnalysis.query.filter_by(snapshot_id=id).all()
    result = []
    for f in files:
        result.append({
            "id": f.id,
            "path": f.path,
            "size": f.size,
            "sha256": f.sha256,
            "flags": json.loads(f.flags or "[]"),
            "scanned_at": f.scanned_at.isoformat() if f.scanned_at else None
        })
    return jsonify(result)



@app.route('/api/snapshot/<int:id>/logs')
def get_logs(id):
    logs = LogEntry.query.filter_by(snapshot_id=id).all()
    return jsonify([{
        "id": log.id,
        "timestamp": log.timestamp,
        "service": log.service,
        "message": log.message
    } for log in logs])






@app.route('/api/snapshot/<int:id>/packages')
def get_packages(id):
    pkgs = Package.query.filter_by(snapshot_id=id).all()
    return jsonify([p.__dict__ for p in pkgs])

@app.route('/api/snapshot/<int:id>/suspicious-packages')
def get_suspicious_packages(id):
    pkgs = SuspiciousPackage.query.filter_by(snapshot_id=id).all()
    return jsonify([p.__dict__ for p in pkgs])


@app.route('/api/snapshot/<int:id>/attacks')
def get_attack_logs(id):
    logs = AttackLog.query.filter_by(snapshot_id=id).all()
    return jsonify([{
        "id": log.id,
        "timestamp": log.timestamp,
        "service": log.service,
        "message": log.message,
        "ip": log.ip,
        "username": log.username,
        "port": log.port,
        "method": log.method,
        "url": log.url,
        "attack_type": log.attack_type
    } for log in logs])


@app.route('/api/snapshot/<int:id>/login-history')
def get_login_history(id):
    logins = LoginEvent.query.filter_by(snapshot_id=id).all()
    return jsonify([{
        "username": l.username,
        "terminal": l.terminal,
        "ip": l.ip,
        "start": l.start,
        "duration": l.duration
    } for l in logins])


@app.route('/api/snapshots/<hostname>')
def get_snapshots_by_hostname(hostname):
    snapshots = Snapshot.query.filter_by(hostname=hostname).order_by(Snapshot.timestamp.desc()).all()
    return jsonify([
        {
            "id": s.id,
            "hostname": s.hostname,
            "ip": s.ip,
            "timestamp": s.timestamp.isoformat()
        } for s in snapshots
    ])

@app.route('/api/report/<int:id>/logs')
def get_logs_and_logins(id):
    logs = LogEntry.query.filter_by(snapshot_id=id).all()
    logins = LoginEvent.query.filter_by(snapshot_id=id).all()

    return jsonify({
        "logs": [{
            "id": log.id,
            "timestamp": log.timestamp,
            "service": log.service,
            "message": log.message
        } for log in logs],
        "logins": [{
            "username": l.username,
            "terminal": l.terminal,
            "ip": l.ip,
            "start": l.start,
            "duration": l.duration
        } for l in logins]
    })


@app.route('/api/report/<int:id>/system')
def report_system(id):
    return get_system_info(id)

@app.route('/api/report/<int:id>/users')
def report_users(id):
    return get_users(id)

@app.route('/api/report/<int:id>/passwords')
def report_passwords(id):
    return get_passwords(id)

@app.route('/api/report/<int:id>/files')
def report_files(id):
    return get_suspect_files(id)

@app.route('/api/report/<int:id>/attacks')
def report_attacks(id):
    return get_attack_logs(id)

@app.route('/api/report/<int:id>/network')
def report_network(id):
    return get_network_info(id)




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
