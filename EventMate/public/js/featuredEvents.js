async function loadFeaturedEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();

        // İlk 3 etkinliği tarihe göre sırala
        const featuredEvents = events
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);

        // Kartları görüntüle
        const cardGrid = document.querySelector('.card-grid');
        cardGrid.innerHTML = ''; // Mevcut kartları temizle

        featuredEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const card = `
                <div class="card">
                    <h4>${event.title}</h4>
                    <p>Yer: ${event.location}</p>
                    <p>Tarih: ${eventDate.toLocaleDateString('tr-TR')}</p>
                    <p>Saat: ${event.time}</p>
                    <a href="/etkinlikler" class="details-button">Detaylar</a>
                </div>
            `;
            cardGrid.innerHTML += card;
        });
    } catch (error) {
        console.error('Öne çıkan etkinlikler yüklenirken hata:', error);
    }
}

// Sayfa yüklendiğinde öne çıkan etkinlikleri getir
document.addEventListener('DOMContentLoaded', loadFeaturedEvents); 