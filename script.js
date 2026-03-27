import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- 1. FIREBASE МЭДЭЭЛЛИЙН САНГИЙН ТҮЛХҮҮР ---
const firebaseConfig = {
    apiKey: "AIzaSyDqEaWLW-Pl6WRhgw22ifp0pi-Zkrqfwq4", 
    authDomain: "erdmiin-dalai-library.firebaseapp.com",
    databaseURL: "https://erdmiin-dalai-library-default-rtdb.firebaseio.com",
    projectId: "erdmiin-dalai-library",
    storageBucket: "erdmiin-dalai-library.firebasestorage.app",
    messagingSenderId: "223189730146",
    appId: "1:223189730146:web:e22672ce71d259d5f7a23b"
};

// --- 2. GROQ API ТҮЛХҮҮР (ШИНЭЭР ОРУУЛСАН) ---
const GROQ_API_KEY = "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";

let db;
let seatsData = {};
let libraryInitialized = false; 
let isAdmin = false;

// Мэдээллийн санг эхлүүлэх
try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase холболт амжилттай");
} catch(e) { 
    console.error("Firebase холболтын алдаа:", e); 
}

// --- ҮНДСЭН ЦЭСНИЙ УДИРДЛАГА ---
window.showLanding = function() {
    document.getElementById('landing').style.display = 'flex';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

window.switchTab = function(id) {
    document.getElementById('landing').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const activeSection = document.getElementById(id);
    if(activeSection) activeSection.classList.add('active');
    if(id === 'library') initLibrary(); 
}

// --- АДМИН НЭВТРЭХ ---
window.adminLogin = function() {
    const pass = prompt("Админы нууц үгээ оруулна уу:");
    if(pass === "admin123") {
        isAdmin = true;
        alert("Админ эрх идэвхжлээ. Та дурын суудлыг ПИН кодгүйгээр чөлөөлөх боломжтой.");
    } else if (pass !== null) {
        alert("Нууц үг буруу байна!");
    }
}

// --- БАГШ НАРЫН ХУВААРЬ ХАЙХ ---
window.filterSchedule = function() {
    var input = document.getElementById("searchTeacher").value.toUpperCase();
    var day = document.getElementById("dayFilter").value.toUpperCase();
    var cls = document.getElementById("classFilter").value.toUpperCase(); 

    var tr = document.getElementById("teacherTable").getElementsByTagName("tr");
    for (var i = 1; i < tr.length; i++) {
        var tdName = tr[i].getElementsByTagName("td")[0];  
        var tdDay = tr[i].getElementsByTagName("td")[3];   
        var tdClass = tr[i].getElementsByTagName("td")[5]; 

        if (tdName && tdDay && tdClass) {
            var txtName = tdName.textContent || tdName.innerText;
            var txtDay = tdDay.textContent || tdDay.innerText;
            var txtClass = tdClass.textContent || tdClass.innerText;

            var matchName = txtName.toUpperCase().indexOf(input) > -1;
            var matchDay = day === "" || txtDay.toUpperCase().indexOf(day) > -1;
            var matchClass = cls === "" || txtClass.toUpperCase().indexOf(cls) > -1;

            if (matchName && matchDay && matchClass) { tr[i].style.display = ""; } 
            else { tr[i].style.display = "none"; }
        }
    }
}

// --- AI УХААЛАГ ТУСЛАХ (GROQ API - LLAMA ЗАГВАР) ---
window.handleKeyPress = function(e) { 
    if(e.key === 'Enter') window.sendMessage(); 
}

window.sendMessage = async function() {
    var input = document.getElementById("chatInput"); 
    var msg = input.value.trim(); 
    if(msg === "") return;
    
    var hist = document.getElementById("chatHistory");
    hist.innerHTML += `<div class="chat-message user-msg">${msg}</div>`; 
    input.value = "";
    
    var loading = document.createElement("div"); 
    loading.className = "chat-message bot-msg"; 
    loading.innerHTML = "<i>Бодож байна...</i>"; 
    hist.appendChild(loading);
    hist.scrollTop = hist.scrollHeight;
    
    try {
        // Groq API руу холбогдох хэсэг
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", 
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + GROQ_API_KEY
            },
            body: JSON.stringify({ 
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: "Чи бол 'Эрдмийн Далай' сургуулийн хиймэл оюун ухаант туслах. Монголоор товч, ойлгомжтой, найрсаг хариул." },
                    { role: "user", content: msg }
                ]
            })
        });

        const data = await response.json();
        hist.removeChild(loading);

        if (data.error) { 
            hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Алдаа: ${data.error.message}</div>`; 
        } else if (data.choices && data.choices[0].message) { 
            hist.innerHTML += `<div class="chat-message bot-msg">${data.choices[0].message.content}</div>`; 
        } else {
            hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Хариу ирсэнгүй.</div>`; 
        }
    } catch(e) { 
        if(hist.contains(loading)) hist.removeChild(loading); 
        hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгана уу.</div>`; 
        console.error(e);
    }
    hist.scrollTop = hist.scrollHeight;
}

// --- НОМЫН ЖАГСААЛТ ---
const books = [
    { title: "Монголын Нууц Товчоо", author: "Ц.Дамдинсүрэн" },
    { title: "Гарри Поттер", author: "Ж.К.Роулинг" },
    { title: "Ногоон нүдэн лам", author: "Ц.Оюунгэрэл" },
    { title: "Математик X", author: "Сурах бичиг" },
    { title: "Физик XI", author: "Сурах бичиг" }
];

function renderBooks(list) {
    const container = document.getElementById('bookList'); 
    if(!container) return;
    container.innerHTML = "";
    list.forEach(b => {
        container.innerHTML += `
        <div class="book-card"><div class="book-cover">📖</div><div class="book-info">
        <div class="book-title">${b.title}</div><div class="book-author">${b.author}</div>
        <button class="order-btn" onclick="alert('Захиалга бүртгэгдлээ!')">Захиалах</button></div></div>`;
    });
}

window.searchBooks = function() {
    const val = document.getElementById('searchBookInput').value.toUpperCase();
    renderBooks(books.filter(b => b.title.toUpperCase().includes(val)));
}

// --- ЦАХИМ ХИЧЭЭЛ ---
window.toggleLessonForm = function() { 
    var f=document.getElementById('addLessonForm'); 
    if(f) f.style.display = f.style.display === 'none' ? 'block' : 'none'; 
}

window.addNewLesson = function() { 
    if(document.getElementById('adminPass').value === 'admin123') {
        alert("Хуваарь шинэчлэгдлээ!"); 
    } else {
        alert("Нууц үг буруу"); 
    }
}

window.addTeleLesson = function() { 
    var subject = document.getElementById('elSubject').value.trim();
    var topic = document.getElementById('elTopic').value.trim();
    var teacher = document.getElementById('elTeacher').value.trim();
    var image = document.getElementById('elImage').value.trim();
    var link = document.getElementById('elLink').value.trim();

    if(!subject || !topic || !link) { alert("Хичээлийн нэр, Сэдэв, Линк гурвыг заавал оруулна уу!"); return; }
    if(!image) { image = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop"; }

    var grid = document.getElementById('lessonGrid');
    var newLessonHTML = `
        <div class="lesson-card" style="border:1px solid #eee; border-radius:15px; overflow:hidden; background:white; box-shadow:0 4px 10px rgba(0,0,0,0.05); animation: fadeIn 0.5s;">
            <div class="lesson-thumb" style="height:150px; background-image: url('${image}'); background-size:cover; background-position:center;"></div>
            <div class="lesson-content" style="padding:15px; display:flex; flex-direction:column; gap:5px;">
                <div class="lesson-subject" style="font-size:12px; color:#e67e22; font-weight:bold;">${subject}</div>
                <div class="lesson-title" style="font-size:16px; font-weight:bold; color:#004aad;">${topic}</div>
                <div class="lesson-teacher" style="font-size:13px; color:#777; margin-bottom:10px;">Багш: ${teacher}</div>
                <a href="${link}" target="_blank" class="lesson-btn" style="background:#004aad; color:white; text-align:center; padding:8px; border-radius:8px; text-decoration:none; font-weight:bold;">ҮЗЭХ</a>
            </div>
        </div>`;
    if(grid) grid.insertAdjacentHTML('afterbegin', newLessonHTML);
    
    ['elSubject','elTopic','elTeacher','elImage','elLink'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = "";
    });
    if(document.getElementById('addLessonForm')) document.getElementById('addLessonForm').style.display = 'none'; 
    alert("Хичээл амжилттай нийтлэгдлээ!"); 
}

// --- СУУДАЛ ЗАХИАЛГА БА БОДИТ ХУГАЦААНЫ ХОЛБОЛТ ---
function initLibrary() {
    if(libraryInitialized) return; 

    // Голын 20 ширээг зурах
    const center = document.getElementById('center-tables');
    if(center && center.querySelectorAll('.double-table').length === 0) {
        center.innerHTML = ""; 
        for(let i=1; i<=20; i++) {
            center.innerHTML += `<div class="double-table"><div class="seat table" id="C${i}A">${i}A</div><div class="table-divider"></div><div class="seat table" id="C${i}B">${i}B</div></div>`;
        }
    }

    // Firebase-тэй холбогдох
    if(db) {
        const seatsRef = ref(db, 'seats');
        onValue(seatsRef, (snapshot) => {
            seatsData = snapshot.val() || {};
            document.querySelectorAll('.seat').forEach(s => s.classList.remove('occupied'));
            
            Object.keys(seatsData).forEach(key => {
                const el = document.getElementById(key);
                if(el) {
                    // Хугацаа дууссан бол устгах
                    if(seatsData[key].endTimestamp && seatsData[key].endTimestamp <= Date.now()) {
                        remove(ref(db, 'seats/' + key)); 
                    } else if(seatsData[key].status === 'occupied') {
                        el.classList.add('occupied'); 
                    }
                }
            });
        });
    }

    const library = document.getElementById('library');
    if(library) {
        library.addEventListener('click', e => {
            if(e.target.classList.contains('seat')) {
                const seat = e.target;
                
                if(seat.classList.contains('occupied')) {
                    const data = seatsData[seat.id];
                    if(data) {
                        const uName = data.userName ? data.userName : "Тодорхойгүй";
                        const uClass = data.className ? data.className : "";
                        const bDate = data.bookingDate ? data.bookingDate : "Өнөөдөр";
                        const sTime = data.startTime ? data.startTime : "??:??";
                        const eTime = data.endTime ? data.endTime : "??:??";
                        
                        // Админ эрхтэй бол ПИН шаардахгүй
                        if(isAdmin) {
                            if(confirm(`[АДМИН ЭРХ] Сурагч ${uName} (${uClass})-ийн захиалгыг шууд цуцлах уу?`)) {
                                remove(ref(db, 'seats/' + seat.id));
                                alert("Захиалгыг админ эрхээр устгалаа.");
                            }
                        } else {
                            const msg = `👤 НЭР: ${uName} (${uClass})\n📅 ӨДӨР: ${bDate}\n⏰ ЦАГ: ${sTime} - ${eTime}\n\nЦуцлахын тулд ПИН кодоо хийнэ үү:`;
                            const pinInput = prompt(msg);
                            
                            if(String(pinInput) === String(data.pin)) {
                                remove(ref(db, 'seats/' + seat.id));
                                alert("Захиалга цуцлагдлаа!");
                            } else if(pinInput !== null) {
                                alert("ПИН код буруу байна!");
                            }
                        }
                    }
                    return;
                }
                e.target.classList.toggle('selected');
            }
            
            if(e.target.id === 'bookBtn') handleBooking();
            if(e.target.classList.contains('back-btn')) window.showLanding();
        });
    }
    libraryInitialized = true; 
}

window.handleBooking = function() {
    const selected = document.querySelectorAll('.seat.selected');
    const userName = document.getElementById('userName').value.trim(); 
    const userClass = document.getElementById('userClass').value.trim();
    const pin = document.getElementById('bookingPin').value.trim();
    const bDate = document.getElementById('bookingDate').value;
    const sTime = document.getElementById('startTime').value;
    const eTime = document.getElementById('endTime').value;

    if(selected.length === 0) { alert("Суудал сонгоно уу!"); return; }
    if(userName.length < 2 || userClass.length < 2) { 
        alert("Алдаа: Нэр болон ангиа үнэн зөвөөр бүрэн бичнэ үү!"); return; 
    } 
    if(pin.length !== 4) { alert("Алдаа: 4 оронтой ПИН код хийнэ үү!"); return; }
    if(!bDate || !sTime || !eTime) { alert("Алдаа: Өдөр болон цагаа бүрэн сонгоно уу!"); return; }

    const sTimeVal = sTime === "24:00" ? "23:59:59" : sTime;
    const eTimeVal = eTime === "24:00" ? "23:59:59" : eTime;

    const startTimestamp = new Date(`${bDate}T${sTimeVal}`).getTime();
    const endTimestamp = new Date(`${bDate}T${eTimeVal}`).getTime();

    if (endTimestamp <= startTimestamp) { alert("Алдаа: Дуусах цаг эхлэх цагаас хойш байх ёстой!"); return; }
    if (endTimestamp <= Date.now()) { alert("Алдаа: Өнгөрсөн цагт захиалга хийх боломжгүй!"); return; }

    const maxDurationLimit = 3 * 60 * 60 * 1000;
    if ((endTimestamp - startTimestamp) > maxDurationLimit) {
        alert("Алдаа: Нэг удаагийн захиалгын дээд хугацаа 3 цаг байна!"); return;
    }

    let isDuplicate = false;
    Object.values(seatsData).forEach(data => {
        if (data.status === 'occupied' && data.endTimestamp > Date.now()) {
            if (data.userName.toLowerCase() === userName.toLowerCase() || data.pin === pin) {
                isDuplicate = true;
            }
        }
    });

    if (isDuplicate && !isAdmin) {
        alert("Алдаа: Та өөр суудал захиалсан эсвэл ПИН код давхардаж байна!"); return;
    }

    if(db) {
        const updates = [];
        selected.forEach(s => {
            const request = set(ref(db, 'seats/' + s.id), {
                status: 'occupied',
                pin: pin,
                userName: userName, 
                className: userClass,
                bookingDate: bDate,
                startTime: sTime,
                endTime: eTime,
                endTimestamp: endTimestamp
            });
            updates.push(request);
        });

        Promise.all(updates)
        .then(() => {
            document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
            alert("Амжилттай захиалагдлаа!");
        })
        .catch((error) => { alert("Алдаа гарлаа: " + error.message); });
    }
}

// Хуудас ачааллаж дуусахад номын жагсаалтыг гаргах
document.addEventListener('DOMContentLoaded', () => {
    renderBooks(books);
});
