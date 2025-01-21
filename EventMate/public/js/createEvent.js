document.querySelector('.event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        location: document.getElementById('location').value,
        latitude: document.getElementById('latitude').value,
        longitude: document.getElementById('longitude').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Etkinlik başarıyla oluşturuldu!');
            window.location.href = '/etkinlikler';
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Etkinlik oluşturulurken bir hata oluştu');
        }
    } catch (error) {
        alert(error.message);
        console.error('Hata:', error);
    }
}); 