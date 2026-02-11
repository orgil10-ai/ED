import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- 1. FIREBASE CONFIG (Номын сангийн хэсэг) ---
// Энэ хэсэг таны өмнөх тохиргоогоор хэвээрээ үлдсэн
const firebaseConfig = {
    apiKey: "AIzaSyDqEaWLW-Pl6WRhgw22ifp0pi-Zkrqfwq4",
    authDomain: "erdmiin-dalai-library.firebaseapp.com",
    databaseURL: "https://erdmiin-dalai-library-default-rtdb.firebaseio.com",
    projectId: "erdmiin-dalai-library",
    storageBucket: "erdmiin-dalai-library.firebasestorage.app",
    messagingSenderId: "223189730146",
    appId: "1:223189730146:web:e22672ce71d259d5f7a23b"
};

// --- 2. AI KEY (ШИНЭЧЛЭГДСЭН) ---
// Таны сая явуулсан түлхүүрийг энд хийлээ
const AI_KEY = "AIzaSyABeqYEy5TRCWVGOIGpp5xFzX9EW0doV8M";

let db;
let seatsData = {};

// Firebase холболт шалгах
try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase Connected Successfully");
} catch(e) {
    console.error("Firebase Config Error:", e);
}

// --- GLOBAL FUNCTIONS (HTML-ээс дуудах боломжтой функцүүд) ---

// 1. Хуудас шилжих
window.showLanding = function() {
    document.getElementById('landing').style.display = 'flex';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

window.switchTab = function(id) {
    document.getElementById('landing').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const activeSection = document.getElementById(id);
    if(activeSection) activeSection.classList.add('active');
    
    // Номын сан руу орох үед л ачаална
    if(id === 'library') {
        initLibrary(); 
    }
}

// 2. Багш хайх
window.filterSchedule = function() {
    var input = document.getElementById("searchTeacher").value.toUpperCase();
    var day = document.getElementById("dayFilter").value.toUpperCase();
    var tr = document.getElementById("teacherTable").getElementsByTagName("tr");
    for (var i = 1; i < tr.length; i++) {
        var tdName = tr[i].getElementsByTagName("td")[0];
        var tdDay = tr[i].getElementsByTagName("td")[3];
        if (tdName && tdDay) {
            var txt = tdName.textContent || tdName.innerText;
            var dTxt = tdDay.textContent || tdDay.innerText;
            if (txt.toUpperCase().indexOf(input) > -1 && (day === "" || dTxt.toUpperCase().indexOf(day) > -1)) { tr[i].style.display = ""; } else { tr[i].style.display = "none"; }
        }
    }
}

// 3. AI Чат (Enter дарахад)
window.handleKeyPress = function(e) { 
    if(e.key === 'Enter') sendMessage(); 
}

// 4. AI Чат илгээх (Шинэ түлхүүрээр ажиллана)
window.sendMessage = async function() {
    var input = document.getElementById("chatInput"); 
    var msg = input.value.trim(); 
    if(msg==="") return;
    
    var hist = document.getElementById("chatHistory");
    
    // Хэрэглэгчийн мессеж
    hist.innerHTML += `<div class="chat-message user-msg">${msg}</div>`; 
    input.value = "";
    
    // Уншиж байна...
    var loading = document.createElement("div"); 
    loading.className = "chat-message bot-msg"; 
    loading.innerHTML = "<i>Бодож байна...</i>"; 
    hist.appendChild(loading);
    hist.scrollTop = hist.scrollHeight;
    
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + AI_KEY, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: [{ 
                    parts: [{ text: "Чи бол 'Эрдмийн Далай' сургуулийн туслах. Монголоор товч, найрсаг хариул. Асуулт: " + msg }] 
                }] 
            })
        });

        const data = await response.json();
        hist.removeChild(loading);

        if (data.error) {
            console.error("AI Error:", data.error);
            hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Алдаа: ${data.error.message}</div>`;
        } else {
            const botReply = data.candidates[0].content.parts[0].text.replace(/\*/g, "");
            hist.innerHTML += `<div class="chat-message bot-msg">${botReply}</div>`;
        }

    } catch(e) { 
        hist.removeChild(loading); 
        console.error("Network Error:", e);
        hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Сүлжээний алдаа. Интернэтээ шалгана уу.</div>`; 
    }
    hist.scrollTop = hist.scrollHeight;
}

// 5. Ном захиалга (Жагсаалт)
const books = [
    { title: "Монголын Нууц Товчоо", author: "Ц.Дамдинсүрэн" },
    { title: "Гарри Поттер", author: "Ж.К.Роулинг" },
    { title: "Ногоон нүдэн лам", author: "Ц.Оюунгэрэл" },
    { title: "Математик X", author: "Сурах бичиг" },
    { title: "Физик XI", author: "Сурах бичиг" }
];

function renderBooks(list) {
    const container = document.getElementById('bookList'); 
    container.innerHTML = "";
    list.forEach(b => {
        container.innerHTML += `
        <div class="book-card">
            <div class="book-cover">📖</div>
            <div class="book-info">
                <div class="book-title">${b.title}</div>
                <div class="book-author">${b.author}</div>
                <button class="order-btn" onclick="alert('Захиалга бүртгэгдлээ!')">Захиалах</button>
            </div>
        </div>`;
    });
}

window.searchBooks = function() {
    const val = document.getElementById('searchBookInput').value.toUpperCase();
    renderBooks(books.filter(b => b.title.toUpperCase().includes(val)));
}

// 6. Багшийн булан & Цахим хичээл
window.toggleLessonForm = function() { 
    var f=document.getElementById('addLessonForm'); 
    f.style.display = f.style.display==='none'?'block':'none'; 
}
window.addTeleLesson = function() { 
    alert("Нэмэгдлээ!"); 
    document.getElementById('addLessonForm').style.display='none'; 
}
window.addNewLesson = function() { 
    if(document.getElementById('adminPass').value==='1234') alert("Хуваарь шинэчлэгдлээ!"); 
    else alert("Нууц үг буруу"); 
}

// --- 7. LIBRARY LOGIC (НОМЫН САН) ---
function initLibrary() {
    const center = document.getElementById('center-tables');
    
    // Гол ширээ зурах (Давхардахаас сэргийлж шалгана)
    if(center.querySelectorAll('.double-table').length === 0) {
        center.innerHTML = ""; 
        for(let i=1; i<=20; i++) {
            center.innerHTML += `<div class="double-table"><div class="seat table" id="C${i}A">${i}A</div><div class="table-divider"></div><div class="seat table" id="C${i}B">${i}B</div></div>`;
        }
    }

    if(db) {
        const seatsRef = ref(db, 'seats');
        onValue(seatsRef, (snapshot) => {
            seatsData = snapshot.val() || {};
            document.querySelectorAll('.seat').forEach(s => s.classList.remove('occupied'));
            
            Object.keys(seatsData).forEach(key => {
                const el = document.getElementById(key);
                // Хугацаа дууссан эсэхийг шалгах
                if(seatsData[key].endTime < Date.now()) {
                    remove(ref(db, 'seats/' + key)); // Автоматаар чөлөөлөх
                } else if(el && seatsData[key].status === 'occupied') {
                    el.classList.add('occupied');
                }
            });
        });
    }

    const library = document.getElementById('library');
    const newLibrary = library.cloneNode(true); 
    library.parentNode.replaceChild(newLibrary, library);
    
    newLibrary.addEventListener('click', e => {
        if(e.target.classList.contains('seat')) {
            const seat = e.target;
            
            // ХЭРВЭЭ ЭЗЭНТЭЙ БОЛ -> МЭДЭЭЛЭЛ ХАРАХ БОЛОН ЦУЦЛАХ
            if(seat.classList.contains('occupied')) {
                const data = seatsData[seat.id];
                if(data) {
                    const endDate = new Date(data.endTime);
                    const timeStr = endDate.getHours() + ":" + String(endDate.getMinutes()).padStart(2, '0');
                    const className = data.className ? `АНГИ: ${data.className}\n` : '';
                    
                    const pinInput = prompt(`${className}Энэ суудал ${timeStr}-д дуусна.\n\nЦуцлахын тулд ПИН кодоо хийнэ үү:`);
                    
                    if(String(pinInput) === String(data.pin)) {
                        remove(ref(db, 'seats/' + seat.id));
                        alert("Захиалга цуцлагдлаа!");
                    } else if(pinInput !== null) {
                        alert("ПИН код буруу байна!");
                    }
                }
                return;
            }
            
            // СУУДАЛ СОНГОХ
            e.target.classList.toggle('selected');
        }
        
        if(e.target.id === 'bookBtn') handleBooking();
        if(e.target.classList.contains('back-btn')) window.showLanding();
    });
}

function handleBooking() {
    const selected = document.querySelectorAll('.seat.selected');
    const pin = document.getElementById('bookingPin').value;
    const userClass = document.getElementById('userClass').value;
    const hours = parseInt(document.getElementById('bookingHours').value) || 0;
    const minutes = parseInt(document.getElementById('bookingMinutes').value) || 0;

    if(selected.length === 0) { alert("Суудал сонгоно уу!"); return; }
    if(!userClass) { alert("Ангийн нэрээ оруулна уу! (Жишээ: 10А)"); return; }
    if(pin.length !== 4) { alert("4 оронтой ПИН хийнэ үү!"); return; }
    if(hours === 0 && minutes === 0) { alert("Хугацаагаа сонгоно уу!"); return; }

    // Нийт хугацааг миллисекунд рүү хөрвүүлэх
    const durationMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    const endTime = Date.now() + durationMs;

    selected.forEach(s => {
        if(db) {
            set(ref(db, 'seats/' + s.id), {
                status: 'occupied',
                pin: pin,
                className: userClass,
                endTime: endTime
            });
        }
    });
    document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
    alert("Амжилттай захиалагдлаа!");
}

// Эхлэх үед ачаалах
document.addEventListener('DOMContentLoaded', () => {
    // Эхний удаад номнуудыг харуулна
    renderBooks(books);
});
