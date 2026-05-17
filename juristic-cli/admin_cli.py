"""
Juristic Management System — CLI
ระบบบริหารจัดการนิติบุคคลบ้านจัดสรร
รองรับทุก role: admin/officer, technician, resident
"""

import click
import requests
import os
import time

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich.text import Text
from rich.columns import Columns
from rich import box

console = Console()

BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000/api")
SESSION = {"token": None, "username": None, "role": None, "user": {}}


# ══════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════

def get_headers():
    h = {"Content-Type": "application/json"}
    if SESSION["token"]:
        h["Authorization"] = f"Bearer {SESSION['token']}"
    return h


def api_get(path):
    try:
        r = requests.get(f"{BASE_URL}{path}", headers=get_headers(), timeout=8)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        console.print("[bold red]❌ ไม่สามารถเชื่อมต่อ Backend ได้ ตรวจสอบว่า Django server รันอยู่[/bold red]")
        return None
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        console.print(f"[bold red]❌ {msg}[/bold red]")
        return None


def api_post(path, data=None):
    try:
        r = requests.post(f"{BASE_URL}{path}", headers=get_headers(), json=data, timeout=8)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        console.print("[bold red]❌ ไม่สามารถเชื่อมต่อ Backend ได้[/bold red]")
        return None
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        console.print(f"[bold red]❌ {msg}[/bold red]")
        return None


def api_patch(path, data):
    try:
        r = requests.patch(f"{BASE_URL}{path}", headers=get_headers(), json=data, timeout=8)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        console.print("[bold red]❌ ไม่สามารถเชื่อมต่อ Backend ได้[/bold red]")
        return None
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        console.print(f"[bold red]❌ {msg}[/bold red]")
        return None


def api_put(path, data):
    try:
        r = requests.put(f"{BASE_URL}{path}", headers=get_headers(), json=data, timeout=8)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        console.print(f"[bold red]❌ {msg}[/bold red]")
        return None


def api_delete(path):
    try:
        r = requests.delete(f"{BASE_URL}{path}", headers=get_headers(), timeout=8)
        r.raise_for_status()
        return r.json() if r.content else {"message": "Deleted"}
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or str(e)
        except Exception:
            msg = str(e)
        console.print(f"[bold red]❌ {msg}[/bold red]")
        return None


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def pause():
    Prompt.ask("\n[dim]กด Enter เพื่อกลับเมนู[/dim]")


def show_banner():
    console.print(Panel(
        "[bold cyan]🏠  ระบบบริหารจัดการนิติบุคคลบ้านจัดสรร[/bold cyan]\n"
        "[dim]    Juristic Management System CLI[/dim]",
        border_style="cyan", padding=(0, 4)
    ))


def show_user_bar():
    u = SESSION.get("user", {})
    role_color = {"admin": "red", "officer": "yellow", "technician": "cyan", "resident": "green"}
    role = SESSION.get("role", "")
    color = role_color.get(role, "white")
    console.print(
        f"[dim]เข้าสู่ระบบ: [bold {color}]{u.get('name', SESSION['username'])}[/bold {color}]"
        f" | role: [{color}]{role}[/{color}]"
        f" | unit: {u.get('unit_number', '-')}[/dim]\n"
    )


def status_text(s):
    colors = {
        "pending": "yellow", "assigned": "blue", "in-progress": "cyan",
        "completed": "green", "cancelled": "dim",
        "pending_approval": "magenta", "approved": "bold green", "rejected": "bold red",
    }
    return Text(s, style=colors.get(s, "white"))


def priority_text(p):
    colors = {"high": "bold red", "medium": "yellow", "low": "dim white"}
    return Text(p, style=colors.get(p, "white"))


# ══════════════════════════════════════════════
# LOGIN  →  POST /api/login/
# ══════════════════════════════════════════════

def do_login():
    clear()
    show_banner()
    console.print(Panel("[bold yellow]🔐 เข้าสู่ระบบ[/bold yellow]", border_style="yellow"))

    identifier = Prompt.ask("  Username หรือ Email")
    password = Prompt.ask("  Password", password=True)

    with console.status("[cyan]กำลังเข้าสู่ระบบ...[/cyan]"):
        result = api_post("/login/", {"username": identifier, "password": password})

    if result and result.get("access"):
        SESSION["token"] = result["access"]
        user = result.get("user", {})
        SESSION["username"] = user.get("username", identifier)
        SESSION["role"] = user.get("role", "resident")
        SESSION["user"] = user
        console.print(f"\n[bold green]✅ ยินดีต้อนรับ {user.get('name', identifier)} ({SESSION['role']})[/bold green]")
        time.sleep(1)
        return True

    console.print("\n[bold red]❌ Username/Email หรือ Password ไม่ถูกต้อง[/bold red]")
    time.sleep(1.5)
    return False


# ══════════════════════════════════════════════
# SHARED — ใช้ได้ทุก role
# ══════════════════════════════════════════════

# GET /api/announcements/
def show_announcements():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📢 ประกาศ/ข่าวสาร[/bold cyan]\n")

    data = api_get("/announcements/")
    if data is None:
        pause(); return

    if not data:
        console.print("[dim]ไม่มีประกาศ[/dim]")
        pause(); return

    table = Table(box=box.ROUNDED, border_style="cyan", show_lines=True)
    table.add_column("ID", style="dim", width=5)
    table.add_column("หัวข้อ", min_width=24)
    table.add_column("ประเภท", width=10)
    table.add_column("ความสำคัญ", width=12)
    table.add_column("วันที่", width=16)
    for a in data:
        table.add_row(
            str(a.get("id", "")),
            a.get("title", ""),
            a.get("type", "info"),
            priority_text(a.get("priority", "medium")),
            a.get("date", ""),
        )
    console.print(table)
    pause()


# GET/PATCH /api/me/
def show_my_profile():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]👤 โปรไฟล์ของฉัน[/bold cyan]\n")

    data = api_get("/me/")
    if not data:
        pause(); return

    u = data.get("user", {})
    console.print(Panel(
        f"[bold]ชื่อ:[/bold]          {u.get('name')}\n"
        f"[bold]Username:[/bold]      {u.get('username')}\n"
        f"[bold]Email:[/bold]         {u.get('email')}\n"
        f"[bold]Role:[/bold]          {u.get('role')}\n"
        f"[bold]บ้านเลขที่:[/bold]    {u.get('unit_number', '-')}\n"
        f"[bold]โทร:[/bold]           {u.get('phone', '-')}\n"
        f"[bold]ความถนัด:[/bold]      {u.get('specialty', '-')}\n"
        f"[bold]วันที่สมัคร:[/bold]   {u.get('joinDate', '-')}",
        title="โปรไฟล์", border_style="blue"
    ))

    if Confirm.ask("\nต้องการแก้ไขโปรไฟล์?"):
        payload = {}
        name = Prompt.ask("ชื่อ-นามสกุลใหม่ (Enter ข้าม)", default="").strip()
        if name: payload["name"] = name
        email = Prompt.ask("Email ใหม่ (Enter ข้าม)", default="").strip()
        if email: payload["email"] = email
        phone = Prompt.ask("เบอร์โทรใหม่ (Enter ข้าม)", default="").strip()
        if phone: payload["phone"] = phone

        if payload:
            result = api_patch("/me/", payload)
            if result:
                console.print("[bold green]✅ อัปเดตโปรไฟล์สำเร็จ[/bold green]")
            time.sleep(1)
    pause()


# ══════════════════════════════════════════════
# ADMIN / OFFICER
# ══════════════════════════════════════════════

# GET /api/dashboard-stats/
def admin_dashboard():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📊 Dashboard[/bold cyan]\n")

    data = api_get("/dashboard-stats/")
    if not data:
        pause(); return

    cards = [
        Panel(f"[bold white]{data.get('total', 0)}[/bold white]\n[dim]งานทั้งหมด[/dim]",        border_style="blue",    padding=(1, 3)),
        Panel(f"[bold yellow]{data.get('pending', 0)}[/bold yellow]\n[dim]รอดำเนินการ[/dim]",   border_style="yellow",  padding=(1, 3)),
        Panel(f"[bold blue]{data.get('assigned', 0)}[/bold blue]\n[dim]มอบหมายแล้ว[/dim]",      border_style="blue",    padding=(1, 3)),
        Panel(f"[bold cyan]{data.get('in_progress', 0)}[/bold cyan]\n[dim]กำลังดำเนิน[/dim]",   border_style="cyan",    padding=(1, 3)),
        Panel(f"[bold green]{data.get('completed', 0)}[/bold green]\n[dim]เสร็จสิ้น[/dim]",     border_style="green",   padding=(1, 3)),
        Panel(f"[bold red]{data.get('overdue', 0)}[/bold red]\n[dim]เกินกำหนด[/dim]",           border_style="red",     padding=(1, 3)),
        Panel(f"[bold magenta]{data.get('pending_approval', 0)}[/bold magenta]\n[dim]รออนุมัติ[/dim]", border_style="magenta", padding=(1, 3)),
        Panel(f"[bold green]{data.get('approved', 0)}[/bold green]\n[dim]อนุมัติแล้ว[/dim]",    border_style="green",   padding=(1, 3)),
        Panel(f"[bold cyan]{data.get('technicians', 0)}[/bold cyan]\n[dim]จำนวนช่าง[/dim]",     border_style="cyan",    padding=(1, 3)),
    ]
    console.print(Columns(cards[0:3], equal=True))
    console.print(Columns(cards[3:6], equal=True))
    console.print(Columns(cards[6:9], equal=True))
    pause()


# GET /api/maintenance-requests/
def admin_list_requests():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📋 รายการแจ้งซ่อมทั้งหมด[/bold cyan]\n")

    data = api_get("/maintenance-requests/")
    if data is None:
        pause(); return
    if not data:
        console.print("[dim]ไม่มีรายการ[/dim]")
        pause(); return

    table = Table(box=box.ROUNDED, border_style="cyan", show_lines=True)
    table.add_column("ID",       style="dim", width=5)
    table.add_column("Code",     width=12)
    table.add_column("หมวด",     width=13)
    table.add_column("สถานที่",  width=13)
    table.add_column("ลูกบ้าน", width=13)
    table.add_column("ช่าง",    width=13)
    table.add_column("Priority", width=9)
    table.add_column("Status",   width=14)
    table.add_column("วันที่",   width=11)
    for r in data:
        table.add_row(
            str(r.get("id", "")), r.get("request_code", ""),
            r.get("category", ""), r.get("location", ""),
            r.get("resident", "-"), r.get("technician", "-"),
            priority_text(r.get("priority", "")),
            status_text(r.get("status", "")),
            r.get("created_at", ""),
        )
    console.print(table)
    pause()


# PATCH /api/maintenance-requests/<pk>/manage/
def admin_manage_request():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]⚙️  จัดการคำขอ (มอบหมาย / สถานะ / อนุมัติ)[/bold cyan]\n")

    pk = Prompt.ask("ระบุ Request ID")
    detail = api_get(f"/maintenance-requests/{pk}/")
    if not detail:
        pause(); return

    console.print(Panel(
        f"[bold]Code:[/bold]      {detail.get('request_code')}\n"
        f"[bold]หมวด:[/bold]      {detail.get('category')}   [bold]สถานที่:[/bold] {detail.get('location')}\n"
        f"[bold]รายละเอียด:[/bold] {detail.get('description')}\n"
        f"[bold]ลูกบ้าน:[/bold]   {detail.get('resident', '-')}   [bold]ช่าง:[/bold] {detail.get('technician', '-')}\n"
        f"[bold]Priority:[/bold]  {detail.get('priority')}   [bold]Status:[/bold] {detail.get('status')}\n"
        f"[bold]Deadline:[/bold]  {detail.get('deadline', '-')}",
        title=f"Request #{pk}", border_style="cyan"
    ))

    console.print("\n[dim]กด Enter ข้ามฟิลด์ที่ไม่ต้องการเปลี่ยน[/dim]\n")
    payload = {}

    s = Prompt.ask("Status [pending/assigned/in-progress/completed/cancelled]", default="").strip()
    if s: payload["status"] = s

    p = Prompt.ask("Priority [low/medium/high]", default="").strip()
    if p: payload["priority"] = p

    tid = Prompt.ask("Technician ID (มอบหมายช่าง)", default="").strip()
    if tid: payload["technician_id"] = int(tid)

    dl = Prompt.ask("Deadline (YYYY-MM-DDTHH:MM:SS)", default="").strip()
    if dl: payload["deadline"] = dl

    sd = Prompt.ask("Scheduled Date (YYYY-MM-DD)", default="").strip()
    if sd: payload["scheduled_date"] = sd

    st = Prompt.ask("Scheduled Time (HH:MM)", default="").strip()
    if st: payload["scheduled_time"] = st

    ac = Prompt.ask("Approved Completion [pending_approval/approved/rejected]", default="").strip()
    if ac: payload["approved_completion"] = ac

    if not payload:
        console.print("[dim]ไม่มีการเปลี่ยนแปลง[/dim]")
        pause(); return

    if Confirm.ask(f"\nยืนยันบันทึกการเปลี่ยนแปลง Request #{pk}?"):
        with console.status("[cyan]กำลังบันทึก...[/cyan]"):
            result = api_patch(f"/maintenance-requests/{pk}/manage/", payload)
        if result:
            console.print("[bold green]✅ บันทึกสำเร็จ![/bold green]")
        time.sleep(1.5)
    pause()


# GET /api/technician-schedule/
def admin_technician_schedule():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]🧑‍🔧 ตารางงานช่าง[/bold cyan]\n")

    data = api_get("/technician-schedule/")
    if data is None:
        pause(); return

    for tech in data:
        console.print(Panel(
            f"[bold]ชื่อ:[/bold] {tech.get('name')}  "
            f"[bold]ความถนัด:[/bold] {tech.get('specialty')}  "
            f"[bold]โทร:[/bold] {tech.get('phone', '-')}  "
            f"[bold]งานที่ดำเนินอยู่:[/bold] {tech.get('active_tasks', 0)}",
            title=f"ช่าง ID {tech.get('id')}", border_style="green"
        ))
        tasks = tech.get("tasks", [])
        if tasks:
            t = Table(box=box.SIMPLE_HEAD)
            t.add_column("ID", width=5)
            t.add_column("Code", width=12)
            t.add_column("หมวด")
            t.add_column("สถานที่")
            t.add_column("Status", width=14)
            t.add_column("Deadline", width=20)
            for task in tasks:
                t.add_row(
                    str(task.get("id")), task.get("request_code", ""),
                    task.get("category", ""), task.get("location", ""),
                    status_text(task.get("status", "")),
                    task.get("deadline", "-") or "-",
                )
            console.print(t)
        else:
            console.print("[dim]  ไม่มีงาน[/dim]")
        console.print()
    pause()


# GET /api/technicians/
def admin_list_technicians():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]👷 รายชื่อช่างทั้งหมด[/bold cyan]\n")

    data = api_get("/technicians/")
    if data is None:
        pause(); return

    table = Table(box=box.ROUNDED, border_style="green", show_lines=True)
    table.add_column("ID",       style="dim", width=5)
    table.add_column("ชื่อ",     min_width=16)
    table.add_column("ความถนัด", width=14)
    table.add_column("โทร",      width=14)
    table.add_column("Email",    width=22)
    table.add_column("งานปัจจุบัน", width=13, justify="center")
    table.add_column("เสร็จแล้ว",  width=10, justify="center")
    for t in data:
        table.add_row(
            str(t.get("id")), t.get("name", ""), t.get("specialty", "-"),
            t.get("phone", "-"), t.get("email", "-"),
            str(t.get("active_tasks", 0)), str(t.get("completed_tasks", 0)),
        )
    console.print(table)
    pause()


# GET /api/users/
def admin_list_users():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]👥 รายชื่อผู้ใช้ทั้งหมด[/bold cyan]\n")

    data = api_get("/users/")
    if data is None:
        pause(); return

    table = Table(box=box.ROUNDED, border_style="blue", show_lines=True)
    table.add_column("ID",       style="dim", width=5)
    table.add_column("ชื่อ",     min_width=16)
    table.add_column("Username", width=16)
    table.add_column("Email",    width=22)
    table.add_column("Role",     width=12)
    table.add_column("บ้านเลขที่", width=12)
    table.add_column("โทร",     width=13)
    role_color = {"admin": "red", "officer": "yellow", "technician": "cyan", "resident": "green"}
    for u in data:
        r = u.get("role", "")
        table.add_row(
            str(u.get("id")), u.get("name", ""), u.get("username", ""),
            u.get("email", "-"), Text(r, style=role_color.get(r, "white")),
            u.get("unit_number", "-"), u.get("phone", "-"),
        )
    console.print(table)
    pause()


# POST /api/users/
def admin_create_user():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]➕ เพิ่มผู้ใช้ใหม่[/bold cyan]\n")

    name     = Prompt.ask("ชื่อ-นามสกุล")
    email    = Prompt.ask("Email")
    password = Prompt.ask("Password", password=True)
    role     = Prompt.ask("Role [resident/technician/officer/admin]", default="resident")
    unit     = Prompt.ask("บ้านเลขที่ (Enter ข้าม)", default="")
    phone    = Prompt.ask("เบอร์โทร (Enter ข้าม)", default="")
    specialty = ""
    if role == "technician":
        specialty = Prompt.ask("ความถนัด เช่น ไฟฟ้า, ประปา", default="")

    payload = {"name": name, "email": email, "password": password, "role": role,
               "unit_number": unit, "phone": phone, "specialty": specialty}

    if Confirm.ask("\nยืนยันสร้างผู้ใช้?"):
        with console.status("[cyan]กำลังสร้าง...[/cyan]"):
            result = api_post("/users/", payload)
        if result:
            console.print(f"[bold green]✅ สร้างผู้ใช้สำเร็จ! ID: {result.get('id')}[/bold green]")
        time.sleep(1.5)
    pause()


# PUT /api/users/<pk>/
def admin_edit_user():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]✏️  แก้ไขผู้ใช้[/bold cyan]\n")

    pk = Prompt.ask("ระบุ User ID")
    console.print("[dim]กด Enter ข้ามฟิลด์ที่ไม่ต้องการเปลี่ยน[/dim]\n")

    payload = {}
    name = Prompt.ask("ชื่อ-นามสกุลใหม่", default="").strip()
    if name: payload["name"] = name
    email = Prompt.ask("Email ใหม่", default="").strip()
    if email: payload["email"] = email
    pw = Prompt.ask("Password ใหม่ (Enter ข้าม)", password=True, default="").strip()
    if pw: payload["password"] = pw
    role = Prompt.ask("Role ใหม่ [resident/technician/officer/admin]", default="").strip()
    if role: payload["role"] = role
    unit = Prompt.ask("บ้านเลขที่ใหม่", default="").strip()
    if unit: payload["unit_number"] = unit
    phone = Prompt.ask("เบอร์โทรใหม่", default="").strip()
    if phone: payload["phone"] = phone

    if not payload:
        console.print("[dim]ไม่มีการเปลี่ยนแปลง[/dim]")
        pause(); return

    if Confirm.ask(f"\nยืนยันแก้ไข User #{pk}?"):
        with console.status("[cyan]กำลังบันทึก...[/cyan]"):
            result = api_put(f"/users/{pk}/", payload)
        if result:
            console.print("[bold green]✅ แก้ไขสำเร็จ![/bold green]")
        time.sleep(1.5)
    pause()


# DELETE /api/users/<pk>/
def admin_delete_user():
    clear(); show_banner(); show_user_bar()
    console.print("[bold red]🗑️  ลบผู้ใช้[/bold red]\n")

    pk = Prompt.ask("ระบุ User ID ที่ต้องการลบ")
    if Confirm.ask(f"[bold red]⚠️  ยืนยันลบ User #{pk}? ไม่สามารถกู้คืนได้[/bold red]"):
        with console.status("[red]กำลังลบ...[/red]"):
            result = api_delete(f"/users/{pk}/")
        if result:
            console.print("[bold green]✅ ลบผู้ใช้สำเร็จ[/bold green]")
        time.sleep(1.5)
    pause()


# POST /api/announcements/
def admin_post_announcement():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📢 โพสต์ประกาศ[/bold cyan]\n")

    title    = Prompt.ask("หัวข้อ")
    message  = Prompt.ask("รายละเอียด")
    ann_type = Prompt.ask("ประเภท [info/warning/urgent]", default="info")
    priority = Prompt.ask("ความสำคัญ [low/medium/high]", default="medium")

    console.print(Panel(
        f"[bold]หัวข้อ:[/bold]      {title}\n"
        f"[bold]รายละเอียด:[/bold]  {message}\n"
        f"[bold]ประเภท:[/bold]      {ann_type}   [bold]ความสำคัญ:[/bold] {priority}",
        title="ตัวอย่างประกาศ", border_style="yellow"
    ))

    if Confirm.ask("\nยืนยันโพสต์ประกาศ?"):
        with console.status("[cyan]กำลังโพสต์...[/cyan]"):
            result = api_post("/announcements/", {
                "title": title, "message": message,
                "type": ann_type, "priority": priority,
            })
        if result:
            console.print("[bold green]✅ โพสต์ประกาศสำเร็จ![/bold green]")
        time.sleep(1.5)
    pause()


# ══════════════════════════════════════════════
# TECHNICIAN
# ══════════════════════════════════════════════

# GET /api/tasks/my/
def tech_my_tasks():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📋 งานของฉัน[/bold cyan]\n")

    data = api_get("/tasks/my/")
    if data is None:
        pause(); return
    if not data:
        console.print("[dim]ไม่มีงานที่ได้รับมอบหมาย[/dim]")
        pause(); return

    table = Table(box=box.ROUNDED, border_style="cyan", show_lines=True)
    table.add_column("ID",       style="dim", width=5)
    table.add_column("Code",     width=12)
    table.add_column("หมวด",    width=13)
    table.add_column("สถานที่", width=13)
    table.add_column("ลูกบ้าน", width=13)
    table.add_column("Priority", width=9)
    table.add_column("Status",   width=14)
    table.add_column("Deadline", width=20)
    for t in data:
        table.add_row(
            str(t.get("id")), t.get("request_code", ""),
            t.get("category", ""), t.get("location", ""),
            t.get("resident", "-"),
            priority_text(t.get("priority", "")),
            status_text(t.get("status", "")),
            t.get("deadline", "-") or "-",
        )
    console.print(table)
    pause()


# GET + PATCH /api/tasks/<pk>/
def tech_update_task():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]✏️  อัปเดตสถานะงาน[/bold cyan]\n")

    pk = Prompt.ask("ระบุ Task ID")
    detail = api_get(f"/tasks/{pk}/")
    if not detail:
        pause(); return

    console.print(Panel(
        f"[bold]Code:[/bold]         {detail.get('request_code')}\n"
        f"[bold]หมวด:[/bold]         {detail.get('category')}   [bold]สถานที่:[/bold] {detail.get('location')}\n"
        f"[bold]รายละเอียด:[/bold]    {detail.get('description')}\n"
        f"[bold]Status:[/bold]        {detail.get('status')}   [bold]Deadline:[/bold] {detail.get('deadline', '-')}",
        title=f"Task #{pk}", border_style="cyan"
    ))

    console.print("\n[dim]กด Enter ข้ามฟิลด์ที่ไม่ต้องการเปลี่ยน[/dim]\n")
    payload = {}

    s = Prompt.ask("Status ใหม่ [assigned/in-progress/completed]", default="").strip()
    if s: payload["status"] = s
    notes = Prompt.ask("บันทึกช่าง (technician_notes)", default="").strip()
    if notes: payload["technician_notes"] = notes
    materials = Prompt.ask("วัสดุที่ใช้ (materials_used)", default="").strip()
    if materials: payload["materials_used"] = materials

    if not payload:
        console.print("[dim]ไม่มีการเปลี่ยนแปลง[/dim]")
        pause(); return

    if Confirm.ask(f"\nยืนยันบันทึก Task #{pk}?"):
        with console.status("[cyan]กำลังบันทึก...[/cyan]"):
            result = api_patch(f"/tasks/{pk}/", payload)
        if result:
            console.print("[bold green]✅ บันทึกสำเร็จ![/bold green]")
        time.sleep(1.5)
    pause()


# POST /api/tasks/<pk>/request-extension/
def tech_request_extension():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📅 ขอขยายเวลางาน[/bold cyan]\n")

    pk     = Prompt.ask("ระบุ Task ID")
    days   = Prompt.ask("จำนวนวันที่ต้องการขยาย")
    reason = Prompt.ask("เหตุผล")

    if Confirm.ask(f"\nยืนยันขอขยาย {days} วัน สำหรับ Task #{pk}?"):
        with console.status("[cyan]กำลังส่งคำขอ...[/cyan]"):
            result = api_post(f"/tasks/{pk}/request-extension/", {"days": days, "reason": reason})
        if result:
            console.print("[bold green]✅ ส่งคำขอขยายเวลาสำเร็จ![/bold green]")
        time.sleep(1.5)
    pause()


# ══════════════════════════════════════════════
# RESIDENT
# ══════════════════════════════════════════════

# GET /api/maintenance-requests/
def resident_my_requests():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]📋 รายการแจ้งซ่อมของฉัน[/bold cyan]\n")

    data = api_get("/maintenance-requests/")
    if data is None:
        pause(); return
    if not data:
        console.print("[dim]ยังไม่มีรายการแจ้งซ่อม[/dim]")
        pause(); return

    table = Table(box=box.ROUNDED, border_style="cyan", show_lines=True)
    table.add_column("ID",       style="dim", width=5)
    table.add_column("Code",     width=12)
    table.add_column("หมวด",    width=13)
    table.add_column("สถานที่", width=13)
    table.add_column("ช่าง",    width=13)
    table.add_column("โทรช่าง", width=13)
    table.add_column("Priority", width=9)
    table.add_column("Status",   width=14)
    table.add_column("วันที่",   width=11)
    for r in data:
        table.add_row(
            str(r.get("id")), r.get("request_code", ""),
            r.get("category", ""), r.get("location", ""),
            r.get("technician", "-"), r.get("technician_phone", "-"),
            priority_text(r.get("priority", "")),
            status_text(r.get("status", "")),
            r.get("created_at", ""),
        )
    console.print(table)
    pause()


# POST /api/maintenance-requests/
def resident_submit_request():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]➕ แจ้งซ่อม/ปัญหา[/bold cyan]\n")

    category    = Prompt.ask("หมวดหมู่ เช่น ไฟฟ้า, ประปา, งานช่าง")
    location    = Prompt.ask("สถานที่ เช่น ห้องน้ำชั้น 1, บริเวณรั้ว")
    description = Prompt.ask("รายละเอียดปัญหา")
    priority    = Prompt.ask("ความเร่งด่วน [low/medium/high]", default="medium")
    specialty   = Prompt.ask("ความถนัดช่างที่ต้องการ (Enter ข้าม)", default="")

    console.print(Panel(
        f"[bold]หมวด:[/bold]       {category}\n"
        f"[bold]สถานที่:[/bold]    {location}\n"
        f"[bold]รายละเอียด:[/bold] {description}\n"
        f"[bold]Priority:[/bold]   {priority}",
        title="สรุปคำขอแจ้งซ่อม", border_style="yellow"
    ))

    if Confirm.ask("\nยืนยันส่งคำขอแจ้งซ่อม?"):
        with console.status("[cyan]กำลังส่ง...[/cyan]"):
            result = api_post("/maintenance-requests/", {
                "category": category, "location": location,
                "description": description, "priority": priority,
                "specialty_required": specialty,
            })
        if result:
            code = result.get("request", {}).get("request_code", "")
            console.print(f"[bold green]✅ แจ้งซ่อมสำเร็จ! Code: {code}[/bold green]")
        time.sleep(1.5)
    pause()


# GET /api/maintenance-requests/<pk>/
def resident_request_detail():
    clear(); show_banner(); show_user_bar()
    console.print("[bold cyan]🔍 ดูรายละเอียดคำขอ[/bold cyan]\n")

    pk   = Prompt.ask("ระบุ Request ID")
    data = api_get(f"/maintenance-requests/{pk}/")
    if not data:
        pause(); return

    console.print(Panel(
        f"[bold]Code:[/bold]           {data.get('request_code')}\n"
        f"[bold]หมวด:[/bold]           {data.get('category')}\n"
        f"[bold]สถานที่:[/bold]         {data.get('location')}\n"
        f"[bold]รายละเอียด:[/bold]      {data.get('description')}\n"
        f"[bold]Priority:[/bold]        {data.get('priority')}\n"
        f"[bold]Status:[/bold]          {data.get('status')}\n"
        f"[bold]การอนุมัติ:[/bold]      {data.get('approved_completion', '-')}\n"
        f"[bold]ช่าง:[/bold]            {data.get('technician', '-')}\n"
        f"[bold]โทรช่าง:[/bold]         {data.get('technician_phone', '-')}\n"
        f"[bold]นัดวันที่:[/bold]       {data.get('scheduled_date', '-')} {data.get('scheduled_time', '') or ''}\n"
        f"[bold]Deadline:[/bold]        {data.get('deadline', '-')}\n"
        f"[bold]วันที่สร้าง:[/bold]     {data.get('created_at', '-')}",
        title=f"Request #{pk}", border_style="cyan"
    ))
    pause()


# ══════════════════════════════════════════════
# Role Menus
# ══════════════════════════════════════════════

def build_menu(items):
    """items = list of (key, icon, label)"""
    table = Table(box=box.ROUNDED, border_style="cyan", show_header=False, padding=(0, 2))
    table.add_column("key",  style="bold cyan", width=4)
    table.add_column("icon", width=3)
    table.add_column("label")
    for key, icon, label in items:
        table.add_row(key, icon, label)
    console.print(table)


def admin_menu():
    items = [
        ("1", "📊", "Dashboard"),
        ("2", "📋", "รายการแจ้งซ่อมทั้งหมด"),
        ("3", "⚙️ ", "จัดการคำขอ (มอบหมาย / สถานะ / อนุมัติ)"),
        ("4", "🧑‍🔧", "ตารางงานช่าง"),
        ("5", "👷", "รายชื่อช่างทั้งหมด"),
        ("6", "👥", "รายชื่อผู้ใช้ทั้งหมด"),
        ("7", "➕", "เพิ่มผู้ใช้ใหม่"),
        ("8", "✏️ ", "แก้ไขผู้ใช้"),
        ("9", "🗑️ ", "ลบผู้ใช้"),
        ("A", "📢", "โพสต์ประกาศ"),
        ("B", "📢", "ดูประกาศทั้งหมด"),
        ("C", "👤", "โปรไฟล์ของฉัน"),
        ("0", "🚪", "ออกจากระบบ"),
    ]
    actions = {
        "1": admin_dashboard,         "2": admin_list_requests,
        "3": admin_manage_request,    "4": admin_technician_schedule,
        "5": admin_list_technicians,  "6": admin_list_users,
        "7": admin_create_user,       "8": admin_edit_user,
        "9": admin_delete_user,       "A": admin_post_announcement,
        "B": show_announcements,      "C": show_my_profile,
    }
    choices = [k for k, _, _ in items]

    while True:
        clear(); show_banner(); show_user_bar()
        build_menu(items)
        choice = Prompt.ask("เลือกเมนู", choices=choices).upper()
        if choice == "0":
            break
        if choice in actions:
            actions[choice]()


def technician_menu():
    items = [
        ("1", "📋", "งานของฉัน"),
        ("2", "✏️ ", "อัปเดตสถานะงาน"),
        ("3", "📅", "ขอขยายเวลางาน"),
        ("4", "📢", "ดูประกาศ"),
        ("5", "👤", "โปรไฟล์ของฉัน"),
        ("0", "🚪", "ออกจากระบบ"),
    ]
    actions = {
        "1": tech_my_tasks, "2": tech_update_task,
        "3": tech_request_extension, "4": show_announcements, "5": show_my_profile,
    }
    choices = [k for k, _, _ in items]

    while True:
        clear(); show_banner(); show_user_bar()
        build_menu(items)
        choice = Prompt.ask("เลือกเมนู", choices=choices)
        if choice == "0":
            break
        if choice in actions:
            actions[choice]()


def resident_menu():
    items = [
        ("1", "📋", "รายการแจ้งซ่อมของฉัน"),
        ("2", "➕", "แจ้งซ่อม/ปัญหาใหม่"),
        ("3", "🔍", "ดูรายละเอียดคำขอ"),
        ("4", "📢", "ดูประกาศ"),
        ("5", "👤", "โปรไฟล์ของฉัน"),
        ("0", "🚪", "ออกจากระบบ"),
    ]
    actions = {
        "1": resident_my_requests, "2": resident_submit_request,
        "3": resident_request_detail, "4": show_announcements, "5": show_my_profile,
    }
    choices = [k for k, _, _ in items]

    while True:
        clear(); show_banner(); show_user_bar()
        build_menu(items)
        choice = Prompt.ask("เลือกเมนู", choices=choices)
        if choice == "0":
            break
        if choice in actions:
            actions[choice]()


# ══════════════════════════════════════════════
# Entry Point
# ══════════════════════════════════════════════

@click.command()
@click.option("--url", default=None, help="Base URL เช่น http://localhost:8000/api")
def cli(url):
    """🏠 Juristic Management System CLI — รองรับทุก role"""
    global BASE_URL
    if url:
        BASE_URL = url

    while True:
        if do_login():
            break
        if not Confirm.ask("[yellow]ต้องการลองใหม่?[/yellow]"):
            return

    role = SESSION["role"]
    if role in ("admin", "officer"):
        admin_menu()
    elif role == "technician":
        technician_menu()
    elif role == "resident":
        resident_menu()
    else:
        console.print(f"[red]Role '{role}' ไม่รู้จัก[/red]")

    clear()
    console.print(Panel("[bold cyan]ขอบคุณที่ใช้งานระบบ 🏠[/bold cyan]", border_style="cyan"))


if __name__ == "__main__":
    cli()