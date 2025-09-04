function initNavigation() {
    const navContainer = document.querySelector('nav');
    const navItems = document.querySelectorAll('.nav-item');
    const checkInput = document.getElementById('check');

    navContainer.addEventListener('click', function (e) {
        const clickedItem = e.target.closest('.nav-item');
        if (!clickedItem) return; // Click wasn't on a nav item
        e.preventDefault();

        // Update active state
        navItems.forEach(item => item.classList.remove('active'));
        clickedItem.classList.add('active');

        // Smooth scroll to target section
        const targetId = clickedItem.getAttribute('href')?.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            const scrollOffset = targetSection.offsetTop - 160; // Adjust for fixed header
            window.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
            });
        }

        // Close sidebar menu on click
        if (checkInput) checkInput.checked = false;
    });
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');

    if (loadingOverlay) {
        // Fade out overlay
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            if (header) header.style.visibility = 'visible';
            if (nav) nav.style.visibility = 'visible';
        }, 200);
    } else {
        if (header) header.style.visibility = 'visible';
        if (nav) nav.style.visibility = 'visible';
    }
}

window.addEventListener('load', function () {
    initNavigation();

    // Test nav visibility without waiting for long animations
    setTimeout(hideLoadingOverlay, 500);
});

// Improved Study Room Reservation System
document.addEventListener('DOMContentLoaded', async function() {
    const calendarContainer = document.getElementById('calendar-container');
    let selectedDateStr = toLocalDateString(new Date());

    async function fetchReservations() {
        const res = await fetch("https://outreach-spray-lectures-temporarily.trycloudflare.com/reservations");
        if (res.ok) return await res.json();
        return {};
    }

    function formatDateWords(dateObj) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const suffix = (day === 1 || day === 21 || day === 31) ? "st"
            : (day === 2 || day === 22) ? "nd"
            : (day === 3 || day === 23) ? "rd"
            : "th";
        return `${month} ${day}${suffix}`;
    }

    // Format date as MM-DD-YYYY
    function formatDateMMDDYYYY(dateObj) {
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        return `${mm}-${dd}-${yyyy}`;
    }

    // Render a calendar for the current week and 3 weeks after (total 4 weeks) with days of the week as columns
    async function renderCalendar() {
        const reservations = await fetchReservations();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const endDate = new Date(weekStart);
        endDate.setDate(weekStart.getDate() + 27);

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let html = `<div style="text-align:center; margin-bottom:16px;">
            <span style="font-size:1.5rem; color:#e21836; font-weight:700;">Book The Study Room:</span>
            <span style="font-size:1.15rem; color:#222; font-weight:500; margin-left:10px;">
                ${formatDateWords(weekStart)} – ${formatDateWords(endDate)}
            </span>
        </div>`;

        html += `<div style="overflow-x:auto; width:100%;"><table style="min-width:420px; width:100%; border-collapse:collapse; text-align:center;">`;
        html += `<thead>
            <tr>${daysOfWeek.map(day => `<th style="padding:8px 0; color:#e21836;">${day}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

        let d = new Date(weekStart);
        for (let week = 0; week < 4; week++) {
            html += "<tr>";
            for (let day = 0; day < 7; day++) {
                const dateObj = new Date(d);
                const dateStr = toLocalDateString(dateObj);
                let todayMidnight = new Date();
                todayMidnight.setHours(0, 0, 0, 0);
                let isPast = dateObj < todayMidnight;
                let booked = reservations[dateStr] || {};
                let isFull = Object.keys(booked).length === 24;

                let btnStyle = "width:40px; height:40px; border-radius:50%; border:1px solid #ccc; background:#fff; color:#e21836; font-weight:600; cursor:pointer;";
                if (isPast || isFull) {
                    btnStyle += "background:#ffeaea; color:#e21836; border:2px solid #e21836; cursor:not-allowed;";
                }
                if (dateStr === selectedDateStr) {
                    btnStyle += "box-shadow:0 0 0 3px #e2183644;";
                }
                html += `<td style="padding:8px;">
                    <button class="calendar-day-btn" data-date="${dateStr}" style="${btnStyle}" ${isPast || isFull ? "disabled" : ""}>${dateObj.getDate()}</button>
                </td>`;
                d.setDate(d.getDate() + 1);
            }
            html += "</tr>";
        }
        html += `</tbody></table></div>`;
calendarContainer.innerHTML = html;

// Show reservation form for selected date
await showReservationForm(selectedDateStr);
    }

    calendarContainer.addEventListener('click', async function(e) {
        if (e.target.classList.contains('calendar-day-btn')) {
            selectedDateStr = e.target.getAttribute('data-date');
            await renderCalendar(); // This will use the updated selectedDateStr
        }
    });

    async function showReservationForm() {
        const reservations = await fetchReservations();
        const booked = reservations[selectedDateStr] || {};

        // Generate dropdown options for hours (12-hour format), hide booked times
        function hourOptions(selected, isStart) {
            let opts = "";
            for (let h = 0; h < 24; h++) {
                if (booked[`${h}-${h+1}`]) continue;
                let label = formatHour(h);
                opts += `<option value="${h}"${selected == h ? " selected" : ""}>${label}</option>`;
            }
            return opts;
        }

        // Format hour as 12-hour AM/PM
        function formatHour(h) {
            h = parseInt(h);
            let suffix = h < 12 ? "AM" : "PM";
            let hour = h % 12;
            if (hour === 0) hour = 12;
            return `${hour}:00 ${suffix}`;
        }

        // Render reservation timeline for the next 12 hours from now
        function renderDayTimeline(dateStr, booked) {
            const now = new Date();
            let startHour = now.getHours();
            let timelineHtml = `<div style="margin:24px auto 12px auto; max-width:480px;">
                <div style="font-weight:600; margin-bottom:8px; color:#222;">Reservation Timeline (Next 12 Hours)</div>
                <div style="overflow-x:auto; width:100%; max-width:480px;">
                    <div style="display:flex; min-width:360px; align-items:center; height:54px; border-radius:8px; background:#f3f3f3; overflow:hidden; border:1px solid #ddd;">`;

            for (let i = 0; i < 12; i++) {
                let hour = (startHour + i) % 24;
                const slotKey = `${hour}-${hour+1}`;
                const isBooked = booked[slotKey];
                timelineHtml += `<div title="${isBooked ? isBooked : 'Available'}"
                    style="
                        flex:1;
                        min-width:60px;
                        height:100%;
                        background:${isBooked ? '#e21836' : '#b7e4c7'};
                        color:${isBooked ? '#fff' : '#222'};
                        font-size:1.15rem;
                        font-weight:600;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-right:${i < 11 ? '1px solid #fff' : 'none'};
                        cursor:default;
                        position:relative;
                    ">
                    ${isBooked ? `<span style="font-size:1rem;">${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}<br>${isBooked}</span>` : `<span>${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}</span>`}
                </div>`;
            }
            timelineHtml += `</div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:1rem; margin-top:4px; color:#888; min-width:360px;">
                    <span>${startHour % 12 === 0 ? 12 : startHour % 12}${startHour < 12 ? 'am' : 'pm'}</span>
                    <span>${(startHour + 6) % 24 % 12 === 0 ? 12 : (startHour + 6) % 24 % 12}${(startHour + 6) % 24 < 12 ? 'am' : 'pm'}</span>
                    <span>${(startHour + 11) % 24 % 12 === 0 ? 12 : (startHour + 11) % 24 % 12}${(startHour + 11) % 24 < 12 ? 'am' : 'pm'}</span>
                </div>
            </div>`;
            return timelineHtml;
        }

        // Use formatDateWords for display
        let html = `<div style="text-align:center;">
            <h3 style="color:var(--osu-red);">Reservations for ${formatDateMMDDYYYY(new Date(selectedDateStr))}</h3>
            ${renderDayTimeline(selectedDateStr, booked)}
            <form id="reservation-form" style="display:inline-block; background:#f6f6f6; padding:18px 24px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                <label style="margin-right:12px;">
                    Start Time:
                    <select id="start-hour" style="padding:10px 18px; border-radius:6px; border:1px solid #ccc; margin-left:4px; font-size:1.25rem; min-width:120px; max-height:120px; overflow-y:auto;">
                        ${hourOptions(8, true)}
                    </select>
                </label>
                <label style="margin-right:12px;">
                    End Time:
                    <select id="end-hour" style="padding:10px 18px; border-radius:6px; border:1px solid #ccc; margin-left:4px; font-size:1.25rem; min-width:120px; max-height:120px; overflow-y:auto;">
                        ${hourOptions(9, false)}
                    </select>
                </label>
                <input type="text" id="user-name" placeholder="Your name" required style="padding:6px 12px; border-radius:6px; border:1px solid #ccc; width:140px; margin-right:12px;">
                <button type="submit" id="reserve-btn" style="background:var(--osu-red); color:#fff; border:none; border-radius:6px; padding:8px 20px; font-weight:600; font-size:1.15rem; transition:background 0.2s, box-shadow 0.2s; cursor:pointer;">
                    Reserve
                </button>
            </form>
            <div id="reservation-msg" style="margin-top:8px; color:#b71c1c;"></div>
        </div>`;
        document.getElementById('selected-date-view').innerHTML = html;

        document.getElementById('reservation-form').onsubmit = async function(ev) {
            ev.preventDefault();
            const start = parseInt(document.getElementById('start-hour').value);
            const end = parseInt(document.getElementById('end-hour').value);
            const user = document.getElementById('user-name').value.trim();
            const msgDiv = document.getElementById('reservation-msg');
            if (isNaN(start) || isNaN(end) || start < 0 || end > 24 || start >= end) {
                msgDiv.textContent = "Invalid time range.";
                return;
            }
            const result = await addReservation(selectedDateStr, start, end, user);
            if (result.success) {
                msgDiv.textContent = "Reservation successful!";
                await showReservationForm();
                await renderCalendar();
            } else {
                msgDiv.textContent = result.error || "Error making reservation.";
            }
        };

        // Add hover effect to Reserve button
        const reserveBtn = document.getElementById('reserve-btn');
        if (reserveBtn) {
            reserveBtn.addEventListener('mouseenter', function() {
                reserveBtn.style.background = "#b71c1c";
                reserveBtn.style.boxShadow = "0 2px 12px rgba(226,24,54,0.15)";
            });
            reserveBtn.addEventListener('mouseleave', function() {
                reserveBtn.style.background = "var(--osu-red)";
                reserveBtn.style.boxShadow = "none";
            });
        }
    }

    async function renderCalendar() {
        const reservations = await fetchReservations();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const endDate = new Date(weekStart);
        endDate.setDate(weekStart.getDate() + 27);

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let html = `<div style="text-align:center; margin-bottom:16px;">
            <span style="font-size:1.5rem; color:#e21836; font-weight:700;">Book The Study Room:</span>
            <span style="font-size:1.15rem; color:#222; font-weight:500; margin-left:10px;">
                ${formatDateWords(weekStart)} – ${formatDateWords(endDate)}
            </span>
        </div>`;

        html += `<div style="overflow-x:auto; width:100%;"><table style="min-width:420px; width:100%; border-collapse:collapse; text-align:center;">`;
        html += `<thead>
            <tr>${daysOfWeek.map(day => `<th style="padding:8px 0; color:#e21836;">${day}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

        let d = new Date(weekStart);
        for (let week = 0; week < 4; week++) {
            html += "<tr>";
            for (let day = 0; day < 7; day++) {
                const dateObj = new Date(d);
                const dateStr = toLocalDateString(dateObj);
                let todayMidnight = new Date();
                todayMidnight.setHours(0, 0, 0, 0);
                let isPast = dateObj < todayMidnight;
                let booked = reservations[dateStr] || {};
                let isFull = Object.keys(booked).length === 24;

                let btnStyle = "width:40px; height:40px; border-radius:50%; border:1px solid #ccc; background:#fff; color:#e21836; font-weight:600; cursor:pointer;";
                if (isPast || isFull) {
                    btnStyle += "background:#ffeaea; color:#e21836; border:2px solid #e21836; cursor:not-allowed;";
                }
                if (dateStr === selectedDateStr) {
                    btnStyle += "box-shadow:0 0 0 3px #e2183644;";
                }
                html += `<td style="padding:8px;">
                    <button class="calendar-day-btn" data-date="${dateStr}" style="${btnStyle}" ${isPast || isFull ? "disabled" : ""}>${dateObj.getDate()}</button>
                </td>`;
                d.setDate(d.getDate() + 1);
            }
            html += "</tr>";
        }
        html += `</tbody></table></div>`;
calendarContainer.innerHTML = html;
        await showReservationForm(); // Always uses selectedDateStr
    }

    await renderCalendar();
});

async function addReservation(date, start, end, user) {
    const res = await fetch("https://outreach-spray-lectures-temporarily.trycloudflare.com/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, start, end, user })
    });
    return await res.json();
}

function toLocalDateString(dateObj) {
    // Returns YYYY-MM-DD in local time
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.getElementById('bugForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const desc = document.getElementById('bug-description').value.trim();
    const userEmail = document.getElementById('bug-email').value.trim();
    const res = await fetch('https://outreach-spray-lectures-temporarily.trycloudflare.com/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, user_email: userEmail })
    });
    const msgDiv = document.getElementById('bugFormMsg');
    if (res.ok) {
        msgDiv.textContent = "Thank you! Your bug report has been submitted.";
        msgDiv.style.color = "#228B22";
        msgDiv.style.background = "#eafbe7";
        msgDiv.style.padding = "8px";
        msgDiv.style.borderRadius = "6px";
    } else {
        msgDiv.textContent = "Error submitting bug report. Please try again.";
        msgDiv.style.color = "#b71c1c";
        msgDiv.style.background = "#fff3f3";
    }
});

// Add reservation to the backend
async function addReservation(date, start, end, user) {
    const res = await fetch(BACKEND_URL.replace("/chat", "/reservations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, start, end, user })
    });
    return await res.json();
}

// Filter and render only upcoming events in the Events & Deadlines section
document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.querySelector('.events-grid');
    if (eventsGrid) {
        const now = new Date();
        // Loop through each event card and remove if date has passed
        eventsGrid.querySelectorAll('.event-card').forEach(card => {
            const dateElem = card.querySelector('.event-date');
            if (dateElem) {
                // Try to parse the date from the text
                const dateText = dateElem.textContent.trim();
                // Example formats: "Aug 24, 2025", "Sep 2025", etc.
                let eventDate;
                if (/^[A-Za-z]{3,} \d{1,2}, \d{4}$/.test(dateText)) {
                    // Format: "Aug 24, 2025"
                    eventDate = new Date(dateText);
                } else if (/^[A-Za-z]{3,} \d{4}$/.test(dateText)) {
                    // Format: "Sep 2025"
                    eventDate = new Date(`1 ${dateText}`);
                }
                if (eventDate && eventDate < now) {
                    card.remove();
                }
            }
        });
    }
});
