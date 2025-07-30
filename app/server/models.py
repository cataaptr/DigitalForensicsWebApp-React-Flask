from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()

class Snapshot(db.Model):
    __tablename__ = "snapshots"
    id = db.Column(db.Integer, primary_key=True)
    hostname = db.Column(db.String(100))
    ip = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    system_info = db.relationship("SystemInfo", backref="snapshot", uselist=False)
    users = db.relationship("User", backref="snapshot")
    passwords = db.relationship("PasswordStatus", backref="snapshot")
    network_info = db.relationship("NetworkInfo", backref="snapshot")
    suspicious_ips = db.relationship("SuspiciousIP", backref="snapshot")
    files = db.relationship("FileAnalysis", backref="snapshot")
    logs = db.relationship("LogEntry", backref="snapshot")
    attack_logs = db.relationship("AttackLog", backref="snapshot")
    packages = db.relationship("Package", backref="snapshot")
    suspicious_packages = db.relationship("SuspiciousPackage", backref="snapshot")

    def serialize(self):
        return {
            "id": self.id,
            "hostname": self.hostname,
            "ip": self.ip,
            "timestamp": self.timestamp.isoformat()
        }

class SystemInfo(db.Model):
    __tablename__ = "system_information"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))

    mac = db.Column(db.String(100))
    distro = db.Column(db.String(100))
    kernel = db.Column(db.String(100))
    arch = db.Column(db.String(50))
    install_date = db.Column(db.String(100))

    disk_total = db.Column(db.String(20))
    disk_used = db.Column(db.String(20))
    disk_available = db.Column(db.String(20))

    ram_total = db.Column(db.String(20))
    ram_used = db.Column(db.String(20))
    ram_free = db.Column(db.String(20))

    cpu = db.Column(db.String(200))
    model = db.Column(db.String(200))
    serial = db.Column(db.String(100))
    uptime = db.Column(db.String(100))
    mounted_devices = db.Column(db.Text)
    ports = db.Column(db.Text)

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "mac": self.mac,
            "distro": self.distro,
            "kernel": self.kernel,
            "arch": self.arch,
            "install_date": self.install_date,
            "disk_total": self.disk_total,
            "disk_used": self.disk_used,
            "disk_available": self.disk_available,
            "ram_total": self.ram_total,
            "ram_used": self.ram_used,
            "ram_free": self.ram_free,
            "cpu": self.cpu,
            "model": self.model,
            "serial": self.serial,
            "uptime": self.uptime,
            "mounted_devices": self.mounted_devices,
            "ports": self.ports
        }

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))

    username = db.Column(db.String(100))
    uid = db.Column(db.Integer)
    gid = db.Column(db.Integer)
    home = db.Column(db.String(200))
    shell = db.Column(db.String(100))
    groups = db.Column(db.String(200))
    active_now = db.Column(db.Boolean)
    last_login = db.Column(db.String(100))
    processes = db.Column(db.Text)
    recent_commands = db.Column(db.Text)

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "username": self.username,
            "uid": self.uid,
            "gid": self.gid,
            "home": self.home,
            "shell": self.shell,
            "groups": self.groups,
            "active_now": self.active_now,
            "last_login": self.last_login,
            "processes": self.processes,
            "recent_commands": self.recent_commands
        }

class PasswordStatus(db.Model):
    __tablename__ = "password_statuses"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    username = db.Column(db.String(100))
    status = db.Column(db.String(100))
    cracked_password = db.Column(db.String(100))

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "username": self.username,
            "status": self.status,
            "cracked_password": self.cracked_password
        }

class NetworkInfo(db.Model):
    __tablename__ = "network_info"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    firewall = db.Column(db.Text)
    gateway = db.Column(db.String(100))
    dns = db.Column(db.Text)
    active_connections = db.Column(db.Text)
    captured_traffic = db.Column(db.Text)

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "firewall": self.firewall,
            "gateway": self.gateway,
            "dns": self.dns,
            "active_connections": self.active_connections,
            "captured_traffic": self.captured_traffic
        }

class SuspiciousIP(db.Model):
    __tablename__ = "suspicious_ips"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    ip = db.Column(db.String(50))
    country = db.Column(db.String(100))
    hostname = db.Column(db.String(100))
    org = db.Column(db.String(200))
    loc = db.Column(db.String(100))
    abuse_score = db.Column(db.Integer)

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "ip": self.ip,
            "country": self.country,
            "hostname": self.hostname,
            "org": self.org,
            "loc": self.loc,
            "abuse_score": self.abuse_score
        }

class FileAnalysis(db.Model):
    __tablename__ = "file_analysis"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    path = db.Column(db.String(300))
    size = db.Column(db.String(50))
    sha256 = db.Column(db.String(100))
    flags = db.Column(db.Text)
    scanned_at = db.Column(db.DateTime)

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "path": self.path,
            "size": self.size,
            "sha256": self.sha256,
            "flags": self.flags,
            "scanned_at": self.scanned_at.isoformat() if self.scanned_at else None
        }

class LogEntry(db.Model):
    __tablename__ = "logs"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    timestamp = db.Column(db.String(100))
    service = db.Column(db.String(100))
    message = db.Column(db.Text)

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "timestamp": self.timestamp,
            "service": self.service,
            "message": self.message
        }


class AttackLog(db.Model):
    __tablename__ = "attack_logs"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    timestamp = db.Column(db.String(100))
    service = db.Column(db.String(100))
    message = db.Column(db.Text)
    ip = db.Column(db.String(100))
    username = db.Column(db.String(100))
    port = db.Column(db.String(20))
    method = db.Column(db.String(20))
    url = db.Column(db.String(500))
    attack_type = db.Column(db.String(50))

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "timestamp": self.timestamp,
            "service": self.service,
            "message": self.message,
            "ip": self.ip,
            "username": self.username,
            "port": self.port,
            "method": self.method,
            "url": self.url,
            "attack_type": self.attack_type
        }


class Package(db.Model):
    __tablename__ = "packages"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    name = db.Column(db.String(200))

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "name": self.name
        }

class SuspiciousPackage(db.Model):
    __tablename__ = "suspicious_packages"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    name = db.Column(db.String(200))

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "name": self.name
        }

class LoginEvent(db.Model):
    __tablename__ = "login_events"
    id = db.Column(db.Integer, primary_key=True)
    snapshot_id = db.Column(db.Integer, db.ForeignKey('snapshots.id'))
    username = db.Column(db.String(100))
    terminal = db.Column(db.String(50))
    ip = db.Column(db.String(100))
    start = db.Column(db.String(100))
    duration = db.Column(db.String(50))

    def serialize(self):
        return {
            "id": self.id,
            "snapshot_id": self.snapshot_id,
            "username": self.username,
            "terminal": self.terminal,
            "ip": self.ip,
            "start": self.start,
            "duration": self.duration
        }