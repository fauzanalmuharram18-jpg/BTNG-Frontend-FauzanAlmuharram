const themeToggle = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const carGrid = document.getElementById('carGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const retryButton = document.getElementById('retryButton');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

const API_URL = 'https://api-web.dnccudinus.org/api/mobil';

let carsData = [];

function loadTheme() {
    const savedTheme = localStorage.getItem('luxury-theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('luxury-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('luxury-theme', 'light');
    }
}

themeToggle.addEventListener('click', toggleTheme);

loadTheme();


hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navMenu.addEventListener('click', function(event) {
    if (event.target.classList.contains('nav-link')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

function formatHarga(angka) {
    if (!angka && angka !== 0) return 'Harga tidak tersedia';
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function buatKartuMobil(mobil) {
    // Buat elemen div untuk kartu
    const card = document.createElement('div');
    card.classList.add('car-card');

    const statusText = mobil.status === 'sold' ? 'Sold' : 'Tersedia';
    const statusClass = mobil.status === 'sold' ? 'sold' : 'tersedia';

    card.innerHTML = `
        <div class="car-img-wrapper">
            <img 
                src="${mobil.foto || ''}" 
                alt="${mobil.nama || 'Mobil'}"
                onerror="this.parentElement.innerHTML='<div class=img-placeholder>📷 Gambar tidak tersedia</div>'"
            >
            <span class="car-status ${statusClass}">${statusText}</span>
        </div>
        <div class="car-info">
            <p class="car-brand">${mobil.brand || 'Brand tidak diketahui'}</p>
            <h3 class="car-name">${mobil.nama || 'Nama tidak tersedia'}</h3>
            <p class="car-price">${formatHarga(mobil.harga)}</p>
            <div class="car-specs">
                ${mobil.tahun ? `<span class="car-spec"><span class="car-spec-label">Tahun</span> ${mobil.tahun}</span>` : ''}
                ${mobil.transmisi ? `<span class="car-spec"><span class="car-spec-label">Transmisi</span> ${mobil.transmisi}</span>` : ''}
                ${mobil.bahan_bakar ? `<span class="car-spec"><span class="car-spec-label">BBM</span> ${mobil.bahan_bakar}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

function tampilkanMobil(daftarMobil) {

    carGrid.innerHTML = '';


    if (daftarMobil.length === 0) {
        carGrid.innerHTML = '<div class="no-results">Tidak ada mobil yang sesuai dengan pencarian Anda.</div>';
        return;
    }

    // Buat kartu untuk setiap mobil dan masukkan ke grid
    daftarMobil.forEach(function(mobil) {
        const kartu = buatKartuMobil(mobil);
        carGrid.appendChild(kartu);
    });
}

async function ambilDataMobil() {
    
    loading.style.display = 'block';
    carGrid.innerHTML = '';
    carGrid.appendChild(loading);
    errorMessage.style.display = 'none';

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Gagal mengambil data. Status: ' + response.status);
        }

        const json = await response.json();

        let daftarMobil;
        if (json.data && Array.isArray(json.data)) {
            daftarMobil = json.data;
        } else if (Array.isArray(json)) {
            
            daftarMobil = json;
        } else {
            throw new Error('Format data API tidak sesuai yang diharapkan.');
        }

        carsData = daftarMobil;

        loading.style.display = 'none';

        tampilkanMobil(carsData);

        console.log('Berhasil memuat ' + carsData.length + ' mobil dari API.');

    } catch (error) {

        loading.style.display = 'none';
        carGrid.innerHTML = '';
        errorText.textContent = 'Gagal memuat data mobil: ' + error.message;
        errorMessage.style.display = 'block';
        console.error('Error saat mengambil data API:', error);
    }
}

retryButton.addEventListener('click', ambilDataMobil);

searchInput.addEventListener('input', function() {
    filterDanUrutkan();
});

sortSelect.addEventListener('change', function() {
    filterDanUrutkan();
});

function filterDanUrutkan() {

    const keyword = searchInput.value.toLowerCase().trim();

    let hasil = carsData.filter(function(mobil) {
        const nama = (mobil.nama || '').toLowerCase();
        const brand = (mobil.brand || '').toLowerCase();
        return nama.includes(keyword) || brand.includes(keyword);
    });

    const sortValue = sortSelect.value;

    if (sortValue === 'price-asc') {
        hasil.sort(function(a, b) { return (a.harga || 0) - (b.harga || 0); });
    } else if (sortValue === 'price-desc') {
        hasil.sort(function(a, b) { return (b.harga || 0) - (a.harga || 0); });
    } else if (sortValue === 'name-asc') {
        hasil.sort(function(a, b) { return (a.nama || '').localeCompare(b.nama || ''); });
    } else if (sortValue === 'name-desc') {
        hasil.sort(function(a, b) { return (b.nama || '').localeCompare(a.nama || ''); });
    } else if (sortValue === 'year-desc') {
        hasil.sort(function(a, b) { return (b.tahun || 0) - (a.tahun || 0); });
    }

    tampilkanMobil(hasil);
}

window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.borderBottomColor = 'var(--border-color)';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    ambilDataMobil();
});
