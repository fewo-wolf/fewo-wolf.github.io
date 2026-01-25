const images = Array.from(document.querySelectorAll('.gallery img'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

let currentIndex = 0;
let startX = 0;

function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = images[index].src;
  lightbox.classList.add('active');
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  lightboxImg.src = images[currentIndex].src;
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  lightboxImg.src = images[currentIndex].src;
}

/* Click thumbnails */
images.forEach(img => {
    img.addEventListener('pointerup', e => {
        e.preventDefault();
        openLightbox(parseInt(img.dataset.index));
    });
});

/* Close on click */
lightbox.addEventListener('click', closeLightbox);

/* Keyboard */
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

/* Swipe */
lightbox.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

lightbox.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) > 50) {
    diff > 0 ? showNext() : showPrev();
  }
});

document.addEventListener("DOMContentLoaded", () => {

  fetch("booking.json")
    .then(res => res.json())
    .then(data => renderMonthCalendars(data));

  // Status-Funktion für jeden Tag
  function getDayStatus(date, bookings) {
    const today = new Date();
    today.setHours(0,0,0,0); // Heute 00:00

    const d = new Date(date);
    d.setHours(0,0,0,0);    // Vergleich nur nach Datum

    // 1. Vergangenheit
    if (d < today) return "past";

    // 2. Heute
    if (d.getTime() === today.getTime()) return "current";

    // 3. Buchungen prüfen
    for (const period of bookings) {
      const start = new Date(period.from); start.setHours(0,0,0,0);
      const end   = new Date(period.to);   end.setHours(0,0,0,0);

      if (d >= start && d <= end) {
        if (period.status === "booked") return "booked";
        if (period.status === "free") return "free";
      }
    }

    // 4. Standard = frei
    return "free";
  }


  function renderMonthCalendars(data) {
    const container = document.getElementById("booking");

    Object.keys(data).forEach(monthKey => {
      const [year, month] = monthKey.split("-");
      const y = parseInt(year,10);
      const m = parseInt(month,10)-1;

      const firstDay = new Date(y,m,1);
      const lastDay = new Date(y,m+1,0);
      const daysInMonth = lastDay.getDate();

      // Tabelle
      const table = document.createElement("table");
      table.className = "booking-table";

      // Caption
      const caption = document.createElement("caption");
      caption.textContent = firstDay.toLocaleString("de-DE", { month: "long", year: "numeric" });
      table.appendChild(caption);

      // Header: Mo, Di, ... So
      const headerRow = document.createElement("tr");
      ["Mo","Di","Mi","Do","Fr","Sa","So"].forEach(day => {
        const th = document.createElement("th");
        th.textContent = day;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      let row = document.createElement("tr");
      // Leere Zellen vor dem ersten Tag
      let weekday = firstDay.getDay(); // 0=So, 1=Mo ...
      let emptyCells = weekday === 0 ? 6 : weekday-1;
      for (let i=0;i<emptyCells;i++) row.appendChild(document.createElement("td"));

      for (let d=1; d<=daysInMonth; d++) {
        const date = new Date(y,m,d);
        const cell = document.createElement("td");

        const cls = getDayStatus(date, data[monthKey]);
        cell.classList.add(cls);
        cell.textContent = d;

        row.appendChild(cell);

        // Wenn Sonntag → neue Zeile
        if (date.getDay() === 0) {
          table.appendChild(row);
          row = document.createElement("tr");
        }
      }

      // Restliche leere Zellen am Ende
      while (row.children.length < 7) {
        row.appendChild(document.createElement("td"));
      }
      table.appendChild(row);

      container.appendChild(table);
    });
  }

});

