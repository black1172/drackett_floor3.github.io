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
document.addEventListener('DOMContentLoaded', function() {
    const calendarContainer = document.getElementById('calendar-container');
    const reservationsList = document.getElementById('reservations-list');

    // Helper to get reservations from localStorage
    function getReservations() {
        return JSON.parse(localStorage.getItem('studyRoomReservations') || '{}');
    }
    function saveReservations(reservations) {
        localStorage.setItem('studyRoomReservations', JSON.stringify(reservations));
    }

    // Helper to format date as "Month Day" (e.g., August 25th)
    function formatDateWords(dateObj) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        // Add ordinal suffix
        const suffix = (day === 1 || day === 21 || day === 31) ? "st"
            : (day === 2 || day === 22) ? "nd"
            : (day === 3 || day === 23) ? "rd"
            : "th";
        return `${month} ${day}${suffix}`;
    }

    // Render a calendar for the current week and 3 weeks after (total 4 weeks) with days of the week as columns
    function renderCalendar() {
        const now = new Date();
        const reservations = getReservations();

        // Find start of current week (Sunday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());

        // Calculate end date (3 weeks after current week, so 28 days total)
        const endDate = new Date(weekStart);
        endDate.setDate(weekStart.getDate() + 27);

        // Days of week labels
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        let html = `<div style="text-align:center; margin-bottom:16px;">
            <strong>Book The Study Room: ${formatDateWords(weekStart)} – ${formatDateWords(endDate)}</strong>
        </div>`;

        html += `<table style="width:100%; border-collapse:collapse; text-align:center;">
            <thead>
                <tr>${daysOfWeek.map(day => `<th style="padding:8px 0; color:#b71c1c;">${day}</th>`).join('')}</tr>
            </thead>
            <tbody>`;

        // Generate 4 weeks (rows)
        let d = new Date(weekStart);
        for (let week = 0; week < 4; week++) {
            html += "<tr>";
            for (let day = 0; day < 7; day++) {
                const dateObj = new Date(d); // clone to avoid mutation
                const dateStr = dateObj.toISOString().slice(0, 10);
                let isPast = dateObj < new Date().setHours(0, 0, 0, 0);
                let booked = reservations[dateStr] || {};
                let isFull = Object.keys(booked).length === 24; // All hours booked

                let btnStyle = "width:40px; height:40px; border-radius:50%; border:1px solid #ccc; background:#fff; color:#b71c1c; font-weight:600; cursor:pointer;";
                if (isPast || isFull) {
                    btnStyle += "background:#ffeaea; color:#b71c1c; border:2px solid #b71c1c; cursor:not-allowed;";
                }
                html += `<td style="padding:8px;">
                    <button class="calendar-day-btn" data-date="${dateStr}" style="${btnStyle}" ${isPast || isFull ? "disabled" : ""}>${formatDateWords(dateObj)}</button>
                </td>`;
                d.setDate(d.getDate() + 1);
            }
            html += "</tr>";
        }
        html += `</tbody></table>
        <div id="selected-date-view" style="margin-top:24px;"></div>`;
        calendarContainer.innerHTML = html;
    }
    renderCalendar();

    // Handle day selection
    calendarContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-day-btn')) {
            const selectedDate = e.target.getAttribute('data-date');
            showReservationForm(selectedDate);
        }
    });

    // Show reservation form for selected day (improved look and dropdowns, hide booked times)
    function showReservationForm(dateStr) {
        const reservations = getReservations();
        const booked = reservations[dateStr] || {};
        let bookedTimes = Object.entries(booked).map(([slot, user]) => {
            const [start, end] = slot.split('-');
            return `${formatHour(start)} - ${formatHour(end)} (${user})`;
        });

        // Generate dropdown options for hours (12-hour format), hide booked times
        function hourOptions(selected, isStart) {
            let opts = "";
            for (let h = 0; h < 24; h++) {
                // If any slot for this hour is booked, skip
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

        // Use formatDateWords for display
        let html = `<div style="text-align:center;">
            <h3 style="color:var(--osu-red);">Reservations for ${formatDateWords(new Date(dateStr))}</h3>
            <div style="margin-bottom:12px;">
                ${bookedTimes.length ? bookedTimes.map(t => `<div style="color:#b71c1c;">${t}</div>`).join('') : '<span style="color:#888;">No reservations yet.</span>'}
            </div>
            <form id="reservation-form" style="display:inline-block; background:#f6f6f6; padding:18px 24px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                <label style="margin-right:12px;">
                    Start Time:
                    <select id="start-hour" style="padding:6px 10px; border-radius:6px; border:1px solid #ccc; margin-left:4px;">
                        ${hourOptions(8, true)}
                    </select>
                </label>
                <label style="margin-right:12px;">
                    End Time:
                    <select id="end-hour" style="padding:6px 10px; border-radius:6px; border:1px solid #ccc; margin-left:4px;">
                        ${hourOptions(9, false)}
                    </select>
                </label>
                <input type="text" id="user-name" placeholder="Your name" required style="padding:6px 12px; border-radius:6px; border:1px solid #ccc; width:140px; margin-right:12px;">
                <button type="submit" style="background:var(--osu-red); color:#fff; border:none; border-radius:6px; padding:8px 20px; font-weight:600;">Reserve</button>
            </form>
            <div id="reservation-msg" style="margin-top:8px; color:#b71c1c;"></div>
        </div>`;
        document.getElementById('selected-date-view').innerHTML = html;

        // Handle reservation submission
        document.getElementById('reservation-form').onsubmit = function(ev) {
            ev.preventDefault();
            const start = parseInt(document.getElementById('start-hour').value);
            const end = parseInt(document.getElementById('end-hour').value);
            const user = document.getElementById('user-name').value.trim();
            const msgDiv = document.getElementById('reservation-msg');
            if (isNaN(start) || isNaN(end) || start < 0 || end > 24 || start >= end) {
                msgDiv.textContent = "Invalid time range.";
                return;
            }
            // Check for conflicts
            for (let hour = start; hour < end; hour++) {
                if (booked[`${hour}-${hour+1}`]) {
                    msgDiv.textContent = `Time slot ${formatHour(hour)} - ${formatHour(hour+1)} is already booked.`;
                    return;
                }
            }
            // Book all slots in range
            if (!reservations[dateStr]) reservations[dateStr] = {};
            for (let hour = start; hour < end; hour++) {
                reservations[dateStr][`${hour}-${hour+1}`] = user;
            }
            saveReservations(reservations);
            msgDiv.textContent = "Reservation successful!";
            showReservationForm(dateStr); // Refresh view
            renderCalendar(); // Refresh calendar to update full days
        };
    }

    // Optionally, show today's reservations in the daily list
    function renderDailyReservations() {
        const today = new Date().toISOString().slice(0,10);
        const reservations = getReservations();
        reservationsList.innerHTML = "";
        if (reservations[today]) {
            Object.entries(reservations[today]).forEach(([slot, user]) => {
                const [start, end] = slot.split('-');
                const timeStr = `${start}:00 - ${end}:00`;
                const li = document.createElement('li');
                li.textContent = `${timeStr}: ${user}`;
                reservationsList.appendChild(li);
            });
        } else {
            reservationsList.innerHTML = "<li>No reservations for today.</li>";
        }
    }
    renderDailyReservations();
});
