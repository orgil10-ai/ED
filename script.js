// 1. Хуудас хооронд шилжих функц
function showSection(sectionId) {
    // Бүх хэсгийг нуух
    document.getElementById('teachers').style.display = 'none';
    document.getElementById('rooms').style.display = 'none';
    document.getElementById('library').style.display = 'none';
    
    // Сонгосон хэсгийг ил гаргах
    document.getElementById(sectionId).style.display = 'block';
}

// 2. Багш хайх функц
function filterTable(tableId) {
    let input = document.getElementById("searchTeacher");
    let filter = input.value.toUpperCase();
    let table = document.getElementById(tableId);
    let tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[0]; // Нэрээр нь хайх
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

// 3. Номын сангийн суудал сонгох логик
const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied)');
const count = document.getElementById('count');
const bookBtn = document.getElementById('bookBtn');

// Суудал дээр дарахад идэвхжүүлэх
container.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
        e.target.classList.toggle('selected');
        updateSelectedCount();
    }
});

function updateSelectedCount() {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const selectedSeatsCount = selectedSeats.length;
    count.innerText = selectedSeatsCount;
}

// Захиалах товч
bookBtn.addEventListener('click', () => {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    if (selectedSeats.length > 0) {
        alert("Та амжилттай захиаллаа!");
        // Бодит систем дээр энд өгөгдлийн бааз руу мэдээлэл явуулна
        selectedSeats.forEach(seat => {
            seat.classList.remove('selected');
            seat.classList.add('occupied'); // Захиалсан болгож улаан болгоно
        });
        updateSelectedCount();
    } else {
        alert("Та суудал сонгоогүй байна.");
    }
});
