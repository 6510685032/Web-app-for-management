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
        err_msg("ไม่สามารถเชื่อมต่อ Backend ได้ ตรวจสอบว่า Django server รันอยู่")
        return None
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        err_msg(f"{msg}")
        return None


def api_post(path, data=None):
    try:
        r = requests.post(f"{BASE_URL}{path}", headers=get_headers(), json=data, timeout=8)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        err_msg("ไม่สามารถเชื่อมต่อ Backend ได้")
        return None
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        err_msg(f"{msg}")
        return None


def api_patch(path, data):
    try:
        r = requests.patch(f"{BASE_URL}{path}", headers=get_headers(), json=data, timeout=8)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        err_msg("ไม่สามารถเชื่อมต่อ Backend ได้")
        return None
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get("error") or e.response.json().get("message") or str(e)
        except Exception:
            msg = str(e)
        err_msg(f"{msg}")
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
        err_msg(f"{msg}")
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
        err_msg(f"{msg}")
        return None


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def pause():
    console.print()
    console.rule("[dim]━[/dim]", style="dim white")
    Prompt.ask("[dim]  ↵  กด Enter เพื่อกลับ[/dim]")


def show_request_selector(data, title="รายการคำขอ"):
    if not data:
        info("ไม่มีรายการ")
        return

    table = Table(
        title=title,
        box=box.SIMPLE_HEAD,
        border_style="bright_black",
        header_style="bold bright_white",
        show_lines=False,
    )

    table.add_column("ID", style="bold bright_cyan", width=5)
    table.add_column("Code", width=12)
    table.add_column("หมวด", width=14)
    table.add_column("สถานที่", width=14)
    table.add_column("Priority", width=10)
    table.add_column("Status", width=14)

    for r in data:
        table.add_row(
            str(r.get("id", "")),
            r.get("request_code", ""),
            r.get("category", ""),
            r.get("location", ""),
            priority_text(r.get("priority", "")),
            status_text(r.get("status", "")),
        )

    console.print(table)
    console.print()


def show_task_selector(data, title="รายการงาน"):
    if not data:
        info("ไม่มีงาน")
        return

    table = Table(
        title=title,
        box=box.SIMPLE_HEAD,
        border_style="bright_black",
        header_style="bold bright_white",
        show_lines=False,
    )

    table.add_column("ID", style="bold bright_cyan", width=5)
    table.add_column("Code", width=12)
    table.add_column("หมวด", width=14)
    table.add_column("สถานที่", width=14)
    table.add_column("Priority", width=10)
    table.add_column("Status", width=14)

    for t in data:
        table.add_row(
            str(t.get("id", "")),
            t.get("request_code", ""),
            t.get("category", ""),
            t.get("location", ""),
            priority_text(t.get("priority", "")),
            status_text(t.get("status", "")),
        )

    console.print(table)
    console.print()


# ── Theme ────────────────────────────────────────────
ROLE_COLOR  = {"admin": "bright_red", "officer": "yellow", "technician": "bright_cyan", "resident": "bright_green"}
ROLE_ICON   = {"admin": "⬡", "officer": "◈", "technician": "⚙", "resident": "⌂"}
STATUS_CFG  = {
    "pending":          ("◌", "yellow"),
    "assigned":         ("◎", "bright_blue"),
    "in-progress":      ("◉", "bright_cyan"),
    "completed":        ("●", "bright_green"),
    "cancelled":        ("○", "bright_black"),
    "pending_approval": ("◈", "bright_magenta"),
    "approved":         ("✦", "bright_green"),
    "rejected":         ("✕", "bright_red"),
}
PRIORITY_CFG = {
    "high":   ("▲", "bright_red"),
    "medium": ("■", "yellow"),
    "low":    ("▽", "bright_black"),
}

ASCII_LOGO = """\
  [bold bright_cyan]██╗███╗   ███╗███████╗[/bold bright_cyan]
  [bold bright_cyan]██║████╗ ████║██╔════╝[/bold bright_cyan]
  [bold bright_cyan]██║██╔████╔██║███████╗[/bold bright_cyan]
  [bold bright_cyan]██║██║╚██╔╝██║╚════██║[/bold bright_cyan]
  [bold bright_cyan]██║██║ ╚═╝ ██║███████║[/bold bright_cyan]
  [bold bright_cyan]╚═╝╚═╝     ╚═╝╚══════╝[/bold bright_cyan]"""

SUBTITLE = "  [dim white]Juristic Management System  ·  CLI v2[/dim white]"
DIVIDER  = "  [dim white]" + "─" * 42 + "[/dim white]"


def show_banner():
    console.print()
    console.print(ASCII_LOGO)
    console.print(SUBTITLE)
    console.print(DIVIDER)
    console.print()


def show_user_bar():
    u    = SESSION.get("user", {})
    role = SESSION.get("role", "")
    col  = ROLE_COLOR.get(role, "white")
    icon = ROLE_ICON.get(role, "•")
    name = u.get("name", SESSION.get("username", ""))
    unit = u.get("unit_number") or "—"
    console.print(
        f"  [{col}]{icon}[/{col}]  "
        f"[bold {col}]{name}[/bold {col}]"
        f"  [dim white]·[/dim white]  [{col}]{role.upper()}[/{col}]"
        f"  [dim white]·  unit {unit}[/dim white]"
    )
    console.print(DIVIDER + "\n")


def section(title: str, icon: str = ""):
    label = f"{icon}  {title}" if icon else title
    console.print(f"  [bold bright_white]{label}[/bold bright_white]")
    console.print("  [dim]" + "─" * (len(title) + 6) + "[/dim]\n")


def ok(msg: str):
    console.print(f"\n  [bold bright_green]✔[/bold bright_green]  [bright_white]{msg}[/bright_white]")


def err_msg(msg: str):
    console.print(f"\n  [bold bright_red]✘[/bold bright_red]  [bright_white]{msg}[/bright_white]")


def info(msg: str):
    console.print(f"  [dim white]{msg}[/dim white]")


def status_text(s):
    styles = {
        "pending": "black on yellow",
        "assigned": "white on blue",
        "in-progress": "black on cyan",
        "completed": "white on green",
        "cancelled": "white on bright_black",
        "pending_approval": "white on magenta",
        "approved": "white on green",
        "rejected": "white on red",
    }

    return Text(f" {s.upper()} ", style=styles.get(s, "white"))

def priority_text(p):
    icon, color = PRIORITY_CFG.get(p, ("·", "white"))
    return Text(f"{icon} {p}", style=color)


def make_table(*cols, border="bright_black") -> Table:
    t = Table(
        box=box.SIMPLE_HEAD,
        border_style=border,
        header_style="bold bright_white",
        show_lines=False,
        pad_edge=True,
    )
    for name, kwargs in cols:
        t.add_column(name, **kwargs)
    return t


# ══════════════════════════════════════════════
# LOGIN  →  POST /api/login/
# ══════════════════════════════════════════════

def do_login():
    clear()
    show_banner()
    console.print("  [bold bright_white]SIGN IN[/bold bright_white]")
    console.print(DIVIDER + "\n")

    identifier = Prompt.ask("  [bright_white]Username / Email[/bright_white]")
    password   = Prompt.ask("  [bright_white]Password       [/bright_white]", password=True)

    with console.status("  [bright_cyan]กำลังตรวจสอบ...[/bright_cyan]"):
        result = api_post("/login/", {"username": identifier, "password": password})

    if result and result.get("access"):
        SESSION["token"] = result["access"]
        user = result.get("user", {})
        SESSION["username"] = user.get("username", identifier)
        SESSION["role"] = user.get("role", "resident")
        SESSION["user"] = user
        role = SESSION["role"]
        col  = ROLE_COLOR.get(role, "white")
        icon = ROLE_ICON.get(role, "•")
        console.print()
        console.print(f"  [{col}]{icon}[/{col}]  [bold {col}]ยินดีต้อนรับ {user.get('name', identifier)}[/bold {col}]  [dim white]({role})[/dim white]")
        time.sleep(1)
        return True

    console.print()
    console.print("  [bold bright_red]✘[/bold bright_red]  [bright_white]Username/Email หรือ Password ไม่ถูกต้อง[/bright_white]")
    time.sleep(1.5)
    return False


# ══════════════════════════════════════════════
# SHARED — ใช้ได้ทุก role
# ══════════════════════════════════════════════

# GET /api/announcements/
def show_announcements():
    clear(); show_banner(); show_user_bar()
    section("ประกาศ/ข่าวสาร", "📢")

    data = api_get("/announcements/")
    if data is None:
        pause(); return

    if not data:
        info("ไม่มีประกาศ")
        pause(); return

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
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
    section("โปรไฟล์ของฉัน", "👤")

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
        title="โปรไฟล์", border_style="bright_black"
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
                ok("อัปเดตโปรไฟล์สำเร็จ")
            time.sleep(1)
    pause()


# ══════════════════════════════════════════════
# ADMIN / OFFICER
# ══════════════════════════════════════════════

# GET /api/dashboard-stats/
def admin_dashboard():
    clear(); show_banner(); show_user_bar()
    section("Dashboard", "📊")

    data = api_get("/dashboard-stats/")
    if not data:
        pause(); return

    def scard(val, label, vc, bc):
        return Panel(
            f"[bold {vc}]{val}[/bold {vc}]\n[dim white]{label}[/dim white]",
            border_style=bc, padding=(1, 4), expand=True
        )
    cards = [
        scard(data.get("total",           0), "งานทั้งหมด",   "bright_white",   "bright_black"),
        scard(data.get("pending",         0), "รอดำเนินการ",  "yellow",         "yellow"),
        scard(data.get("assigned",        0), "มอบหมายแล้ว",  "bright_blue",    "bright_blue"),
        scard(data.get("in_progress",     0), "กำลังดำเนิน",  "bright_cyan",    "bright_cyan"),
        scard(data.get("completed",       0), "เสร็จสิ้น",    "bright_green",   "bright_green"),
        scard(data.get("overdue",         0), "เกินกำหนด",    "bright_red",     "bright_red"),
        scard(data.get("pending_approval",0), "รออนุมัติ",    "bright_magenta", "bright_magenta"),
        scard(data.get("approved",        0), "อนุมัติแล้ว",  "bright_green",   "bright_green"),
        scard(data.get("technicians",     0), "จำนวนช่าง",    "bright_cyan",    "bright_black"),
    ]
    console.print(Columns(cards[0:3], equal=True, expand=True))
    console.print(Columns(cards[3:6], equal=True))
    console.print(Columns(cards[6:9], equal=True))
    pause()


# GET /api/maintenance-requests/
def admin_list_requests():
    clear(); show_banner(); show_user_bar()
    section("รายการแจ้งซ่อมทั้งหมด", "📋")

    data = api_get("/maintenance-requests/")
    if data is None:
        pause(); return
    if not data:
        info("ไม่มีรายการ")
        pause(); return

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
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
    section(" จัดการคำขอ (มอบหมาย / สถานะ / อนุมัติ)", "⚙️")

    # ── แสดง list ก่อน ──
    with console.status("  [bright_cyan]โหลดรายการ...[/bright_cyan]"):
        all_reqs = api_get("/maintenance-requests/")

    if all_reqs:
        show_request_selector(all_reqs, "รายการแจ้งซ่อมทั้งหมด")
        pk = Prompt.ask("  [bright_cyan]›[/bright_cyan] Request ID")

        detail = api_get(f"/maintenance-requests/{pk}/")
        if not detail:
            pause()
            return

        console.print(Panel(
            f"[bold]Code:[/bold]      {detail.get('request_code')}\n"
            f"[bold]หมวด:[/bold]      {detail.get('category')}   [bold]สถานที่:[/bold] {detail.get('location')}\n"
            f"[bold]รายละเอียด:[/bold] {detail.get('description')}\n"
            f"[bold]ลูกบ้าน:[/bold]   {detail.get('resident', '-')}   [bold]ช่าง:[/bold] {detail.get('technician', '-')}\n"
            f"[bold]Priority:[/bold]  {detail.get('priority')}   [bold]Status:[/bold] {detail.get('status')}\n"
            f"[bold]Deadline:[/bold]  {detail.get('deadline', '-')}",
            title=f"Request #{pk}",
            border_style="bright_black"
        ))

        console.print("\n[dim]กด Enter ข้ามฟิลด์ที่ไม่ต้องการเปลี่ยน[/dim]\n")

        payload = {}

        s = Prompt.ask(
            "Status [pending/assigned/in-progress/completed/cancelled]",
            default=""
        ).strip()
        if s:
            payload["status"] = s

        p = Prompt.ask(
            "Priority [low/medium/high]",
            default=""
        ).strip()
        if p:
            payload["priority"] = p

        tid = Prompt.ask(
            "Technician ID (มอบหมายช่าง)",
            default=""
        ).strip()
        if tid:
            payload["technician_id"] = int(tid)

        if not payload:
            info("ไม่มีการเปลี่ยนแปลง")
            pause()
            return

        if Confirm.ask(f"\nยืนยันบันทึก Request #{pk}?"):
            with console.status("  [bright_cyan]บันทึก...[/bright_cyan]"):
                result = api_patch(
                    f"/maintenance-requests/{pk}/manage/",
                    payload
                )

            if result:
                ok("บันทึกสำเร็จ!")

            time.sleep(1.5)

        pause()
    else:
        info("ไม่มีรายการ")
        pause()
        return

# GET /api/technician-schedule/
def admin_technician_schedule():
    clear(); show_banner(); show_user_bar()
    section("ตารางงานช่าง", "🧑‍🔧")

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
    section("รายชื่อช่างทั้งหมด", "👷")

    data = api_get("/technicians/")
    if data is None:
        pause(); return

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
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
    section("รายชื่อผู้ใช้ทั้งหมด", "👥")

    data = api_get("/users/")
    if data is None:
        pause(); return

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
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
    section("เพิ่มผู้ใช้ใหม่", "➕")

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
        with console.status("  [bright_cyan]กำลังสร้าง...[/bright_cyan]"):
            result = api_post("/users/", payload)
        if result:
            ok(f"สร้างผู้ใช้สำเร็จ! ID: {result.get('id')}")
        time.sleep(1.5)
    pause()


# PUT /api/users/<pk>/
def admin_edit_user():
    clear(); show_banner(); show_user_bar()
    section(" แก้ไขผู้ใช้", "✏️")

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
        info("ไม่มีการเปลี่ยนแปลง")
        pause(); return

    if Confirm.ask(f"\nยืนยันแก้ไข User #{pk}?"):
        with console.status("  [bright_cyan]บันทึก...[/bright_cyan]"):
            result = api_put(f"/users/{pk}/", payload)
        if result:
            ok("แก้ไขสำเร็จ!")
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
            ok("ลบผู้ใช้สำเร็จ")
        time.sleep(1.5)
    pause()


# POST /api/announcements/
def admin_post_announcement():
    clear(); show_banner(); show_user_bar()
    section("โพสต์ประกาศ", "📢")

    title    = Prompt.ask("หัวข้อ")
    message  = Prompt.ask("รายละเอียด")
    ann_type = Prompt.ask("ประเภท [info/warning/urgent]", default="info")
    priority = Prompt.ask("ความสำคัญ [low/medium/high]", default="medium")

    console.print(Panel(
        f"[bold]หัวข้อ:[/bold]      {title}\n"
        f"[bold]รายละเอียด:[/bold]  {message}\n"
        f"[bold]ประเภท:[/bold]      {ann_type}   [bold]ความสำคัญ:[/bold] {priority}",
        title="ตัวอย่างประกาศ", border_style="bright_black"
    ))

    if Confirm.ask("\nยืนยันโพสต์ประกาศ?"):
        with console.status("  [bright_cyan]กำลังโพสต์...[/bright_cyan]"):
            result = api_post("/announcements/", {
                "title": title, "message": message,
                "type": ann_type, "priority": priority,
            })
        if result:
            ok("โพสต์ประกาศสำเร็จ!")
        time.sleep(1.5)
    pause()


# ══════════════════════════════════════════════
# TECHNICIAN
# ══════════════════════════════════════════════

# GET /api/tasks/my/
def tech_my_tasks():
    clear(); show_banner(); show_user_bar()
    section("งานของฉัน", "📋")

    data = api_get("/tasks/my/")
    if data is None:
        pause(); return
    if not data:
        info("ไม่มีงานที่ได้รับมอบหมาย")
        pause(); return

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
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
    section(" อัปเดตสถานะงาน", "✏️")

    # ── แสดง list งานของฉันก่อน ──
    with console.status("  [bright_cyan]โหลดรายการงาน...[/bright_cyan]"):
        all_tasks = api_get("/tasks/my/")

    if all_tasks:
        show_task_selector(all_tasks, "งานของฉัน")
        pk = Prompt.ask("  [bright_cyan]›[/bright_cyan] Request ID")

        detail = api_get(f"/maintenance-requests/{pk}/")
        if not detail:
            pause()
            return

        console.print(Panel(
            f"[bold]Code:[/bold]      {detail.get('request_code')}\n"
            f"[bold]หมวด:[/bold]      {detail.get('category')}   [bold]สถานที่:[/bold] {detail.get('location')}\n"
            f"[bold]รายละเอียด:[/bold] {detail.get('description')}\n"
            f"[bold]ลูกบ้าน:[/bold]   {detail.get('resident', '-')}   [bold]ช่าง:[/bold] {detail.get('technician', '-')}\n"
            f"[bold]Priority:[/bold]  {detail.get('priority')}   [bold]Status:[/bold] {detail.get('status')}\n"
            f"[bold]Deadline:[/bold]  {detail.get('deadline', '-')}",
            title=f"Request #{pk}",
            border_style="bright_black"
        ))

        console.print("\n[dim]กด Enter ข้ามฟิลด์ที่ไม่ต้องการเปลี่ยน[/dim]\n")

        payload = {}

        s = Prompt.ask(
            "Status [pending/assigned/in-progress/completed/cancelled]",
            default=""
        ).strip()
        if s:
            payload["status"] = s

        p = Prompt.ask(
            "Priority [low/medium/high]",
            default=""
        ).strip()
        if p:
            payload["priority"] = p

        tid = Prompt.ask(
            "Technician ID (มอบหมายช่าง)",
            default=""
        ).strip()
        if tid:
            payload["technician_id"] = int(tid)

        if not payload:
            info("ไม่มีการเปลี่ยนแปลง")
            pause()
            return

        if Confirm.ask(f"\nยืนยันบันทึก Request #{pk}?"):
            with console.status("  [bright_cyan]บันทึก...[/bright_cyan]"):
                result = api_patch(
                    f"/maintenance-requests/{pk}/manage/",
                    payload
                )

            if result:
                ok("บันทึกสำเร็จ!")

            time.sleep(1.5)

        pause()
    else:
        info("ไม่มีงานที่ได้รับมอบหมาย")
        pause()
        return


# POST /api/tasks/<pk>/request-extension/
def tech_request_extension():
    clear(); show_banner(); show_user_bar()
    section("ขอขยายเวลางาน", "📅")

    # ── แสดง list งานของฉันก่อน ──
    with console.status("  [bright_cyan]โหลดรายการงาน...[/bright_cyan]"):
        all_tasks = api_get("/tasks/my/")
    if all_tasks:
        active = [t for t in all_tasks if t.get("status") not in ("completed", "cancelled")]
        if not active:
            info("ไม่มีงานที่สามารถขอขยายเวลาได้")
            pause(); return
        table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", show_lines=False)
        table.add_column("ID",           style="bold cyan", width=5)
        table.add_column("Code",         width=12)
        table.add_column("หมวด",        width=13)
        table.add_column("Status",       width=14)
        table.add_column("Deadline",     width=20)
        table.add_column("Extension",    width=12)
        for t in active:
            ext = t.get("extension_status") or "none"
            ext_colors = {"pending": "yellow", "approved": "green", "rejected": "red", "none": "dim"}
            table.add_row(
                str(t.get("id")), t.get("request_code", ""),
                t.get("category", ""),
                status_text(t.get("status", "")),
                t.get("deadline", "-") or "-",
                Text(ext, style=ext_colors.get(ext, "white")),
            )
        console.print(table)
        console.print()
    else:
        info("ไม่มีงานที่ได้รับมอบหมาย")
        pause(); return

    pk     = Prompt.ask("  [bright_cyan]›[/bright_cyan] Task ID")
    days   = Prompt.ask("จำนวนวันที่ต้องการขยาย")
    reason = Prompt.ask("เหตุผล")

    if Confirm.ask(f"\nยืนยันขอขยาย {days} วัน สำหรับ Task #{pk}?"):
        with console.status("[cyan]กำลังส่งคำขอ...[/cyan]"):
            result = api_post(f"/tasks/{pk}/request-extension/", {"days": days, "reason": reason})
        if result:
            ok("ส่งคำขอขยายเวลาสำเร็จ!")
        time.sleep(1.5)
    pause()


# ══════════════════════════════════════════════
# RESIDENT
# ══════════════════════════════════════════════

# GET /api/maintenance-requests/
def resident_my_requests():
    clear(); show_banner(); show_user_bar()
    section("รายการแจ้งซ่อมของฉัน", "📋")

    data = api_get("/maintenance-requests/")
    if data is None:
        pause(); return
    if not data:
        info("ยังไม่มีรายการแจ้งซ่อม")
        pause(); return

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
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
    section("แจ้งซ่อม/ปัญหา", "➕")

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
        title="สรุปคำขอแจ้งซ่อม", border_style="bright_black"
    ))

    if Confirm.ask("\nยืนยันส่งคำขอแจ้งซ่อม?"):
        with console.status("  [bright_cyan]กำลังส่ง...[/bright_cyan]"):
            result = api_post("/maintenance-requests/", {
                "category": category, "location": location,
                "description": description, "priority": priority,
                "specialty_required": specialty,
            })
        if result:
            code = result.get("request", {}).get("request_code", "")
            ok(f"แจ้งซ่อมสำเร็จ! Code: {code}")
        time.sleep(1.5)
    pause()


# GET /api/maintenance-requests/<pk>/
def resident_request_detail():
    clear(); show_banner(); show_user_bar()
    section("ดูรายละเอียดคำขอ", "🔍")

    # ── แสดง list คำขอของฉันก่อน ──
    with console.status("  [bright_cyan]โหลดรายการ...[/bright_cyan]"):
        all_reqs = api_get("/maintenance-requests/")

    if all_reqs:
        show_request_selector(all_reqs, "รายการแจ้งซ่อมของฉัน")
        pk = Prompt.ask("  [bright_cyan]›[/bright_cyan] Request ID")

        detail = api_get(f"/maintenance-requests/{pk}/")
        if not detail:
            pause()
            return

        console.print(Panel(
            f"[bold]Code:[/bold]      {detail.get('request_code')}\n"
            f"[bold]หมวด:[/bold]      {detail.get('category')}   [bold]สถานที่:[/bold] {detail.get('location')}\n"
            f"[bold]รายละเอียด:[/bold] {detail.get('description')}\n"
            f"[bold]ลูกบ้าน:[/bold]   {detail.get('resident', '-')}   [bold]ช่าง:[/bold] {detail.get('technician', '-')}\n"
            f"[bold]Priority:[/bold]  {detail.get('priority')}   [bold]Status:[/bold] {detail.get('status')}\n"
            f"[bold]Deadline:[/bold]  {detail.get('deadline', '-')}",
            title=f"Request #{pk}",
            border_style="bright_black"
        ))

        console.print("\n[dim]กด Enter ข้ามฟิลด์ที่ไม่ต้องการเปลี่ยน[/dim]\n")

        payload = {}

        s = Prompt.ask(
            "Status [pending/assigned/in-progress/completed/cancelled]",
            default=""
        ).strip()
        if s:
            payload["status"] = s

        p = Prompt.ask(
            "Priority [low/medium/high]",
            default=""
        ).strip()
        if p:
            payload["priority"] = p

        tid = Prompt.ask(
            "Technician ID (มอบหมายช่าง)",
            default=""
        ).strip()
        if tid:
            payload["technician_id"] = int(tid)

        if not payload:
            info("ไม่มีการเปลี่ยนแปลง")
            pause()
            return

        if Confirm.ask(f"\nยืนยันบันทึก Request #{pk}?"):
            with console.status("  [bright_cyan]บันทึก...[/bright_cyan]"):
                result = api_patch(
                    f"/maintenance-requests/{pk}/manage/",
                    payload
                )

            if result:
                ok("บันทึกสำเร็จ!")

            time.sleep(1.5)

        pause()
    else:
        info("ยังไม่มีรายการแจ้งซ่อม")
        pause()
        return


# ══════════════════════════════════════════════
# NOTIFICATIONS — ใช้ได้ทุก role
# ══════════════════════════════════════════════

# GET /api/notifications/
def show_notifications():
    clear(); show_banner(); show_user_bar()
    section("การแจ้งเตือน", "🔔")

    data = api_get("/notifications/")
    if data is None:
        pause(); return

    if not data:
        info("ไม่มีการแจ้งเตือน")
        pause(); return

    unread = sum(1 for n in data if not n.get("read"))
    if unread:
        console.print(f"[bold yellow]📬 ยังไม่อ่าน {unread} รายการ[/bold yellow]\n")

    type_style = {
        "info":    ("💬", "cyan"),
        "warning": ("⚠️ ", "yellow"),
        "success": ("✅", "green"),
        "error":   ("❌", "red"),
    }

    table = Table(box=box.SIMPLE_HEAD, border_style="bright_black", header_style="bold bright_white", show_lines=False)
    table.add_column("ID",      style="dim", width=8)
    table.add_column(" ",       width=3)
    table.add_column("หัวข้อ",  min_width=20)
    table.add_column("ข้อความ", min_width=30)
    table.add_column("วันที่",  width=22)
    table.add_column("อ่าน",   width=6, justify="center")

    for n in data:
        ntype = n.get("type", "info")
        icon, color = type_style.get(ntype, ("💬", "white"))
        read_mark = "[dim]✓[/dim]" if n.get("read") else "[bold yellow]●[/bold yellow]"
        table.add_row(
            str(n.get("id", "")),
            icon,
            Text(n.get("title", ""), style=color if not n.get("read") else "dim"),
            Text(n.get("message", ""), style="dim" if n.get("read") else "white"),
            n.get("timestamp", "")[:19].replace("T", " "),
            read_mark,
        )

    console.print(table)
    console.print()

    action = Prompt.ask(
        "เลือก [bold]R[/bold]=อ่านรายการ  [bold]A[/bold]=อ่านทั้งหมด  [bold]D[/bold]=ลบรายการ  [bold]Enter[/bold]=กลับ",
        default=""
    ).strip().upper()

    if action == "A":
        with console.status("[cyan]กำลังทำเครื่องหมายอ่านทั้งหมด...[/cyan]"):
            result = api_post("/notifications/read-all/")
        if result:
            ok("ทำเครื่องหมายอ่านทั้งหมดสำเร็จ")
        time.sleep(1)

    elif action == "R":
        nid = Prompt.ask("ระบุ Notification ID").strip()
        with console.status("  [bright_cyan]บันทึก...[/bright_cyan]"):
            result = api_patch(f"/notifications/{nid}/read/", {})
        if result:
            ok("ทำเครื่องหมายอ่านแล้ว")
        time.sleep(1)

    elif action == "D":
        nid = Prompt.ask("ระบุ Notification ID ที่ต้องการลบ").strip()
        if Confirm.ask(f"ยืนยันลบการแจ้งเตือน #{nid}?"):
            with console.status("[red]กำลังลบ...[/red]"):
                result = api_delete(f"/notifications/{nid}/")
            if result:
                ok("ลบสำเร็จ")
            time.sleep(1)

    pause()


# ══════════════════════════════════════════════
# RESPOND EXTENSION
# ══════════════════════════════════════════════

# POST /api/tasks/<pk>/respond-extension/
# ใช้ได้: resident (เจ้าของ request) และ admin/officer
def respond_extension():
    clear(); show_banner(); show_user_bar()
    section("ตอบรับคำขอขยายเวลา", "📅")

    role = SESSION.get("role", "")

    # แสดง list งานที่มี extension pending ก่อน
    if role in ("admin", "officer"):
        data = api_get("/maintenance-requests/")
        label = "Request"
    else:
        data = api_get("/maintenance-requests/")
        label = "Request"

    if data:
        pending_ext = [r for r in data if (r.get("extension_status") or "none") == "pending"]
        if pending_ext:
            table = Table(title=f"รายการที่รอตอบรับขยายเวลา ({len(pending_ext)} รายการ)",
                          box=box.SIMPLE_HEAD, border_style="bright_black")
            table.add_column("ID", width=5)
            table.add_column("Code", width=12)
            table.add_column("หมวด")
            table.add_column("ขอขยาย (วัน)", width=14, justify="center")
            table.add_column("เหตุผล")
            for r in pending_ext:
                table.add_row(
                    str(r.get("id")), r.get("request_code", ""),
                    r.get("category", ""),
                    str(r.get("extension_requested_days", "-")),
                    r.get("extension_reason", "-"),
                )
            console.print(table)
        else:
            info("ไม่มีคำขอขยายเวลาที่รออนุมัติ")
            pause(); return
    console.print()

    pk = Prompt.ask(f"ระบุ {label} ID")
    decision = Prompt.ask("ตัดสินใจ [approved/rejected]", choices=["approved", "rejected"])

    action_label = "อนุมัติ ✅" if decision == "approved" else "ปฏิเสธ ❌"
    if Confirm.ask(f"\nยืนยัน[bold]{action_label}[/bold] คำขอขยายเวลา #{pk}?"):
        with console.status("  [bright_cyan]บันทึก...[/bright_cyan]"):
            result = api_post(f"/tasks/{pk}/respond-extension/", {"decision": decision})
        if result:
            if decision == "approved":
                new_deadline = result.get("request", {}).get("deadline", "-")
                ok(f"อนุมัติสำเร็จ! Deadline ใหม่: {new_deadline}")
            else:
                ok("ปฏิเสธคำขอสำเร็จ")
        time.sleep(1.5)
    pause()


# ══════════════════════════════════════════════
# Role Menus
# ══════════════════════════════════════════════

def build_menu(items):
    """items = list of (key, icon, label). Separator = ('', '', '---')"""
    console.print()
    for key, icon, label in items:
        if label == "---":
            console.print("  [dim white]" + "·" * 36 + "[/dim white]")
            continue
        if key == "0":
            style_key = "dim white"
            style_label = "dim white"
        else:
            style_key = "bold bright_cyan"
            style_label = "bright_white"
        console.print(
            f"  [{style_key}] {key} [/{style_key}]"
            f"  {icon}"
            f"  [{style_label}]{label}[/{style_label}]"
        )
    console.print()


def admin_menu():
    items = [
        ("1", "📊", "Dashboard"),
        ("2", "📋", "รายการแจ้งซ่อมทั้งหมด"),
        ("3", "⚙️ ", "จัดการคำขอ  (มอบหมาย / สถานะ / อนุมัติ)"),
        ("",  "",   "---"),
        ("4", "🧑‍🔧", "ตารางงานช่าง"),
        ("5", "👷", "รายชื่อช่างทั้งหมด"),
        ("",  "",   "---"),
        ("6", "👥", "รายชื่อผู้ใช้ทั้งหมด"),
        ("7", "➕", "เพิ่มผู้ใช้ใหม่"),
        ("8", "✏️ ", "แก้ไขผู้ใช้"),
        ("9", "🗑️ ", "ลบผู้ใช้"),
        ("",  "",   "---"),
        ("A", "📢", "โพสต์ประกาศ"),
        ("B", "📢", "ดูประกาศทั้งหมด"),
        ("C", "📅", "ตอบรับคำขอขยายเวลา"),
        ("D", "🔔", "การแจ้งเตือน"),
        ("",  "",   "---"),
        ("E", "👤", "โปรไฟล์ของฉัน"),
        ("0", "🚪", "ออกจากระบบ"),
    ]
    actions = {
        "1": admin_dashboard,         "2": admin_list_requests,
        "3": admin_manage_request,    "4": admin_technician_schedule,
        "5": admin_list_technicians,  "6": admin_list_users,
        "7": admin_create_user,       "8": admin_edit_user,
        "9": admin_delete_user,       "A": admin_post_announcement,
        "B": show_announcements,      "C": respond_extension,
        "D": show_notifications,      "E": show_my_profile,
    }
    choices = [k for k, _, _ in items]

    while True:
        clear(); show_banner(); show_user_bar()
        build_menu(items)
        choice = Prompt.ask("  [dim white]›[/dim white]", choices=choices).upper()
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
        ("5", "🔔", "การแจ้งเตือน"),
        ("6", "👤", "โปรไฟล์ของฉัน"),
        ("0", "🚪", "ออกจากระบบ"),
    ]
    actions = {
        "1": tech_my_tasks,       "2": tech_update_task,
        "3": tech_request_extension, "4": show_announcements,
        "5": show_notifications,  "6": show_my_profile,
    }
    choices = [k for k, _, _ in items]

    while True:
        clear(); show_banner(); show_user_bar()
        build_menu(items)
        choice = Prompt.ask("  [dim white]›[/dim white]", choices=choices)
        if choice == "0":
            break
        if choice in actions:
            actions[choice]()


def resident_menu():
    items = [
        ("1", "📋", "รายการแจ้งซ่อมของฉัน"),
        ("2", "➕", "แจ้งซ่อม/ปัญหาใหม่"),
        ("3", "🔍", "ดูรายละเอียดคำขอ"),
        ("4", "📅", "ตอบรับคำขอขยายเวลา (จากช่าง)"),
        ("5", "📢", "ดูประกาศ"),
        ("6", "🔔", "การแจ้งเตือน"),
        ("7", "👤", "โปรไฟล์ของฉัน"),
        ("0", "🚪", "ออกจากระบบ"),
    ]
    actions = {
        "1": resident_my_requests,   "2": resident_submit_request,
        "3": resident_request_detail,"4": respond_extension,
        "5": show_announcements,     "6": show_notifications,
        "7": show_my_profile,
    }
    choices = [k for k, _, _ in items]

    while True:
        clear(); show_banner(); show_user_bar()
        build_menu(items)
        choice = Prompt.ask("  [dim white]›[/dim white]", choices=choices)
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
    console.print(Panel("[bold cyan]ขอบคุณที่ใช้งานระบบ 🏠[/bold cyan]", border_style="bright_black"))


if __name__ == "__main__":
    cli()