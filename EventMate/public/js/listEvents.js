async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Etkinlikler yüklenirken bir hata oluştu');
        }
        const events = await response.json();

        const eventsContainer = document.querySelector('.events-list .container');
        
        // Başlığı koru, altındaki içeriği temizle
        const title = eventsContainer.querySelector('h3');
        const searchContainer = eventsContainer.querySelector('.search-container');
        eventsContainer.innerHTML = '';
        eventsContainer.appendChild(searchContainer);
        eventsContainer.appendChild(title);

        if (events.length === 0) {
            eventsContainer.innerHTML += '<p class="no-events">Henüz etkinlik bulunmuyor.</p>';
            return;
        }

        const eventsList = document.createElement('div');
        eventsList.className = 'events-container';

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const eventCard = `
                <div class="event-card" data-title="${event.title.toLowerCase()}">
                    <h4>${event.title}</h4>
                    <p>Yer: ${event.location}</p>
                    <p>Tarih: ${eventDate.toLocaleDateString('tr-TR')}</p>
                    <p>Saat: ${event.time}</p>
                    <div class="event-details">
                        <p>${event.description}</p>
                    </div>
                    <a href="#" class="details-button">Detaylar</a>
                </div>
            `;
            eventsList.innerHTML += eventCard;
        });

        eventsContainer.appendChild(eventsList);

        // Detay butonlarına tıklama olayı ekle
        document.querySelectorAll('.details-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const details = e.target.previousElementSibling;
                details.classList.toggle('active');
                e.target.textContent = details.classList.contains('active') ? 'Gizle' : 'Detaylar';
            });
        });

        // Arama fonksiyonu
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchText = e.target.value.toLowerCase();
            document.querySelectorAll('.event-card').forEach(card => {
                const title = card.dataset.title;
                card.style.display = title.includes(searchText) ? 'block' : 'none';
            });
        });

    } catch (error) {
        console.error('Etkinlikler yüklenirken hata:', error);
        const eventsContainer = document.querySelector('.events-list .container');
        eventsContainer.innerHTML += `
            <div class="error-message">
                Etkinlikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadEvents); 