import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDqEaWLW-Pl6WRhgw22ifp0pi-Zkrqfwq4",
    authDomain: "erdmiin-dalai-library.firebaseapp.com",
    databaseURL: "https://erdmiin-dalai-library-default-rtdb.firebaseio.com",
    projectId: "erdmiin-dalai-library",
    storageBucket: "erdmiin-dalai-library.firebasestorage.app",
    messagingSenderId: "223189730146",
    appId: "1:223189730146:web:e22672ce71d259d5f7a23b"
};

// AI KEY
const AI_KEY = "AIzaSyBizr6GJYxmv5AVjYPcKeVbHtOjeW7wyPs";

let db;
let seatsData = {};

try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase Connected Successfully");
} catch(e) {
    console.error("Firebase Connection Failed:", e);
}

// --- GLOBAL FUNCTIONS (HTML-ээс дуудах боломжтой болгох) ---
window.showLanding = function() {
    document.getElementById('landing').style.display = 'flex';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

window.switchTab = function(id) {
    document.getElementById('landing').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const activeSection = document.getElementById(id);
    if(activeSection) activeSection.classList.add('active');
    
    if(id === 'library') {
        initLibrary(); 
    }
}

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

window.handleKeyPress = function(e) { 
    if(e.key === 'Enter') sendMessage(); 
}

window.sendMessage = async function() {
    var input = document.getElementById("chatInput"); 
    var msg = input.value.trim(); 
    if(msg==="") return;
    
    var hist = document.getElementById("chatHistory");
    hist.innerHTML += `<div class="chat-message user-msg">${msg}</div>`; 
    input.value = "";
    
    var loading = document.createElement("div"); 
    loading.className = "chat-message bot-msg"; 
    loading.innerHTML = "<i>Бодож байна...</i>"; 
    hist.appendChild(loading);
    
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + AI_KEY, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: "School assistant. Answer in Mongolian. Q: " + msg }] }] })
        });
        const data = await response.json();
        hist.removeChild(loading);
        hist.innerHTML += `<div class="chat-message bot-msg">${data.candidates ? data.candidates[0].content.parts[0].text : "Алдаа гарлаа."}</div>`;
    } catch(e) { 
        hist.removeChild(loading); 
        hist.innerHTML += `<div class="chat-message bot-msg">Сүлжээний алдаа.</div>`; 
    }
    hist.scrollTop = hist.scrollHeight;
}

// BOOK ORDER
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

// ADMIN & E-LESSON
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

// --- LIBRARY LOGIC ---
function initLibrary() {
    const center = document.getElementById('center-tables');
    if(center.innerHTML === "") {
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
                if(el && seatsData[key].status === 'occupied') {
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
            
            // IF OCCUPIED -> CANCEL
            if(seat.classList.contains('occupied')) {
                const data = seatsData[seat.id];
                if(data) {
                    const endDate = new Date(data.endTime);
                    const timeStr = endDate.getHours() + ":" + String(endDate.getMinutes()).padStart(2, '0');
                    
                    const pinInput = prompt(`Энэ суудал ${timeStr} цагт дуусна.\n\nЦуцлахын тулд ПИН кодоо хийнэ үү:`);
                    if(pinInput === data.pin) {
                        remove(ref(db, 'seats/' + seat.id));
                        alert("Захиалга цуцлагдлаа!");
                    } else if(pinInput !== null) {
                        alert("ПИН код буруу байна!");
                    }
                }
                return;
            }
            
            // IF EMPTY -> SELECT
            e.target.classList.toggle('selected');
        }
        
        if(e.target.id === 'bookBtn') handleBooking();
        if(e.target.classList.contains('back-btn')) window.showLanding();
    });
}

function handleBooking() {
    const selected = document.querySelectorAll('.seat.selected');
    const pin = document.getElementById('bookingPin').value;
    const duration = parseInt(document.getElementById('bookingDuration').value);

    if(selected.length === 0) { alert("Суудал сонгоно уу!"); return; }
    if(pin.length !== 4) { alert("4 оронтой ПИН хийнэ үү!"); return; }
    if(!duration || duration < 1) { alert("Цагаа зөв оруулна уу!"); return; }

    const endTime = Date.now() + (duration * 60 * 60 * 1000); 

    selected.forEach(s => {
        if(db) {
            set(ref(db, 'seats/' + s.id), {
                status: 'occupied',
                pin: pin,
                endTime: endTime
            });
        }
    });
    document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
    alert("Амжилттай захиалагдлаа!");
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    initLibrary();
    renderBooks(books);
});
