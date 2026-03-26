import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqEaWLW-Pl6WRhgw22ifp0pi-Zkrqfwq4",
    authDomain: "erdmiin-dalai-library.firebaseapp.com",
    databaseURL: "https://erdmiin-dalai-library-default-rtdb.firebaseio.com",
    projectId: "erdmiin-dalai-library",
    storageBucket: "erdmiin-dalai-library.firebasestorage.app",
    messagingSenderId: "223189730146",
    appId: "1:223189730146:web:e22672ce71d259d5f7a23b"
};

const GROQ_API_KEY = "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";

let db;
let seatsData = {};
let libraryInitialized = false; 
let isAdmin = false; // ШИНЭ: Админ эрхийг шалгах хувьсагч

try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
} catch(e) { console.error("Firebase Config Error:", e); }

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

// --- АДМИН НЭВТРЭХ ЛОГИК ---
window.adminLogin = function() {
    const pass = prompt("Админы нууц үгээ оруулна уу:");
    if(pass === "admin123") { // Админы нууц үг
        isAdmin = true;
        alert("Админ эрх идэвхжлээ. Та одоо дурын суудлыг ПИН кодгүйгээр чөлөөлөх боломжтой.");
    } else if (pass !== null) {
        alert("Нууц үг буруу байна!");
    }
}

// --- СУУДАЛ ЗАХИАЛГЫН ЛОГИК ---
function initLibrary() {
    if(libraryInitialized) return; 

    const center = document.getElementById('center-tables');
    if(center && center.querySelectorAll('.double-table').length === 0) {
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
                if(el) {
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
                    
                    // АДМИН ЭРХТЭЙ ҮЕД ПИН КОД ШААРДАХГҮЙ УСТГАХ
                    if(isAdmin) {
                        if(confirm(`[АДМИН ЭРХ] Сурагч ${uName} (${uClass})-ийн захиалгыг шууд цуцлах уу?`)) {
                            remove(ref(db, 'seats/' + seat.id));
                            alert("Захиалгыг админ эрхээр устгалаа.");
                        }
                    } else {
                        // ЭНГИЙН ХЭРЭГЛЭГЧИЙН ҮЙЛДЭЛ
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
    
    // БАТАЛГААЖУУЛАЛТ 1: Хоосон зай шалгах (Хамгийн багадаа 2 тэмдэгт байх шаардлагатай)
    if(userName.length < 2 || userClass.length < 2) { 
        alert("Алдаа: Нэр болон ангиа үнэн зөвөөр бүрэн бичнэ үү (Зөвхөн хоосон зай оруулж болохгүй)!"); 
        return; 
    } 
    if(pin.length !== 4) { alert("Алдаа: 4 оронтой ПИН код хийнэ үү!"); return; }
    if(!bDate || !sTime || !eTime) { alert("Алдаа: Өдөр болон цагаа бүрэн сонгоно уу!"); return; }

    const sTimeVal = sTime === "24:00" ? "23:59:59" : sTime;
    const eTimeVal = eTime === "24:00" ? "23:59:59" : eTime;

    const startTimestamp = new Date(`${bDate}T${sTimeVal}`).getTime();
    const endTimestamp = new Date(`${bDate}T${eTimeVal}`).getTime();

    if (endTimestamp <= startTimestamp) {
        alert("Алдаа: Дуусах цаг эхлэх цагаас хойш байх ёстой!");
        return;
    }

    if (endTimestamp <= Date.now()) {
        alert("Алдаа: Өнгөрсөн цагт захиалга хийх боломжгүй!");
        return;
    }

    // БАТАЛГААЖУУЛАЛТ 2: Хугацааны дээд хязгаар шалгах (3 цаг = 10,800,000 миллисекунд)
    const maxDurationLimit = 3 * 60 * 60 * 1000;
    if ((endTimestamp - startTimestamp) > maxDurationLimit) {
        alert("Алдаа: Нэг удаагийн захиалгын дээд хугацаа 3 цаг байна! Хугацаагаа багасгана уу.");
        return;
    }

    // БАТАЛГААЖУУЛАЛТ 3: Давхардал шалгах алгоритм (Duplicate check)
    let isDuplicate = false;
    Object.values(seatsData).forEach(data => {
        if (data.status === 'occupied' && data.endTimestamp > Date.now()) {
            // Нэр эсвэл ПИН код мэдээллийн санд аль хэдийн идэвхтэй байгаа эсэхийг шалгах
            if (data.userName.toLowerCase() === userName.toLowerCase() || data.pin === pin) {
                isDuplicate = true;
            }
        }
    });

    if (isDuplicate && !isAdmin) { // Админ хүн шаардлагатай үед давхардуулж захиалах эрхтэй байж болно
        alert("Алдаа: Та өөр суудал захиалсан эсвэл таны ПИН код давхардаж байна! Нэг сурагч нэг л суудал эзэмших боломжтой.");
        return;
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
        .catch((error) => {
            alert("Өгөгдлийн сантай холбогдоход алдаа гарлаа: " + error.message);
        });
    }
}

// Үлдэгдэл функцүүд (Бусад хэсгийг өөрчлөхгүйгээр доор нь байрлуулна)
window.filterSchedule = function() { /*... (өмнөх код хэвээр үлдэнэ) ...*/ }
window.sendMessage = async function() { /*... (өмнөх код хэвээр үлдэнэ) ...*/ }
window.searchBooks = function() { /*... (өмнөх код хэвээр үлдэнэ) ...*/ }
window.addTeleLesson = function() { /*... (өмнөх код хэвээр үлдэнэ) ...*/ }
