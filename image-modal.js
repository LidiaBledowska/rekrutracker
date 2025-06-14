(function(){
    function escListener(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    }

    window.openImageModal = function(src, alt = '') {
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('imageModalImg');
        if (modal && img) {
            img.src = src;
            img.alt = alt;
            modal.classList.add('active');
            document.addEventListener('keydown', escListener);
        }
    };

    window.closeImageModal = function() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.classList.remove('active');
        document.removeEventListener('keydown', escListener);
    };

    document.addEventListener('DOMContentLoaded', function(){
        const imageModalEl = document.getElementById('imageModal');
        if (imageModalEl) {
            imageModalEl.addEventListener('click', function (e) {
                if (e.target === imageModalEl) {
                    window.closeImageModal();
                }
            });
        }
    });
})();
