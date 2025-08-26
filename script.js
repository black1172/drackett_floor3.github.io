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

    // Render a simple calendar for day selection (current month) with reserved/past days in red
    function renderCalendar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const todayStr = now.toISOString().slice(0,10);
        const lastDay = new Date(year, month + 1, 0);
        const reservations = getReservations();

        let html = `<div style="text-align:center; margin-bottom:16px;">
            <strong>${now.toLocaleString('default', { month: 'long' })} ${year}</strong>
        </div><div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">`;

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = dateObj.toISOString().slice(0,10);
            let isPast = dateObj < now.setHours(0,0,0,0);
            let booked = reservations[dateStr] || {};
            let isFull = Object.keys(booked).length === 24; // All hours booked

            let btnStyle = "width:40px; height:40px; border-radius:50%; border:1px solid #ccc; background:#fff; color:#b71c1c; font-weight:600; cursor:pointer;";
            if (isPast || isFull) {
                btnStyle += "background:#ffeaea; color:#b71c1c; border:2px solid #b71c1c; cursor:not-allowed;";
            }
            html += `<button class="calendar-day-btn" data-date="${dateStr}" style="${btnStyle}" ${isPast || isFull ? "disabled" : ""}>${d}</button>`;
        }
        html += `</div>
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

        let html = `<div style="text-align:center;">
            <h3 style="color:var(--osu-red);">Reservations for ${dateStr}</h3>
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
