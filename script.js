// Цэс хооронд шилжих функц (Энийг script-ийн гадна байлгаж болно)
function showSection(sectionId) {
    const sections = ['teachers', 'rooms', 'library'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        // style.display = '' гэдэг нь CSS дээрх анхны байдалд нь оруулна (Layout эвдэхгүй)
        element.style.display = (id === sectionId) ? '' : 'none';
    });
}

// Веб хуудас бүрэн ачаалж дууссаны дараа ажиллах хэсэг
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. БАГШИЙН ХУВААРЬ ХАЙХ ХЭСЭГ ---
    const searchInput = document.getElementById("searchTeacher");
    if (searchInput) {
        searchInput.addEventListener("keyup", function() {
            const filter = searchInput.value.trim().toUpperCase();
            const table = document.getElementById("teacherTable");
            if (!table) return;
            const tr = table.getElementsByTagName("tr");
            
            for (let i = 1; i < tr.length; i++) {
                const td = tr[i].getElementsByTagName("td")[0];
                if (!td) continue;
                const txtValue = (td.textContent || td.innerText).toUpperCase();
                tr[i].style.display = txtValue.indexOf(filter) > -1 ? "" : "none";
            }
        });
    }

    // --- 2. НОМЫН САНГИЙН СУУДАЛ ЗАХИАЛАХ ХЭСЭГ ---
    const container = document.querySelector('.library-container');
    const bookBtn = document.getElementById('bookBtn');
    const countEl = document.getElementById('count');

    function updateCount() {
        if (!countEl || !container) return;
        const selectedSeats = container.querySelectorAll('.seat.selected');
        countEl.innerText = selectedSeats.length;
    }

    if (container) {
        container.addEventListener('click', (e) => {
            // closest('.seat') нь суудлын аль ч хэсэгт дарсан 'seat' элементийг олж өгнө
            const seat = e.target.closest('.seat');
            if (!seat || !container.contains(seat)) return;
            if (seat.classList.contains('occupied')) return;
            
            seat.classList.toggle('selected');
            updateCount();
        });
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (!container) return;
            const selectedSeats = Array.from(container.querySelectorAll('.seat.selected'));
            if (selectedSeats.length === 0) {
                alert("Та суудал сонгоогүй байна! Сул суудлуудаас сонгоно уу.");
                return;
            }
            
            // data-seat-name эсвэл доторх текстийг авна
            const seatNames = selectedSeats.map(s => (s.dataset.seatName || s.innerText || '').trim());
            alert(`Амжилттай! Та [${seatNames.join(", ")}] суудлуудыг захиаллаа.`);
            
            selectedSeats.forEach(seat => {
                seat.classList.remove('selected');
                seat.classList.add('occupied');
            });
            updateCount();
        });
    }

    // Анхны тооллогыг эхлүүлэх
    updateCount();
});
