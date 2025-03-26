let hls = null;
        let currentVideoIndex = 0;
        const videoPlayer = document.getElementById('videoPlayer');
        const playlistContainer = document.getElementById('playlist');

        // Inicialização
        function init() {
            // Carregar primeiro vídeo da playlist
            const initialVideo = playlistContainer.querySelector('.playlist-item.active');
            if (initialVideo) loadVideo(initialVideo);
            
            // Adicionar evento de clique na playlist
            playlistContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.playlist-item');
                if (item) loadVideo(item);
            });

            videoPlayer.addEventListener('ended', handleVideoEnd);
        }

        function loadVideo(item) {
            // Remover active de todos
            document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
            // Marcar como ativo
            item.classList.add('active');
            
            // Obter dados do vídeo
            const sources = JSON.parse(item.dataset.sources);
            const thumbnail = item.dataset.thumbnail;
            
            // Atualizar miniatura (se necessário)
            const img = item.querySelector('img');
            if (img && thumbnail) img.src = thumbnail;

            // Carregar vídeo
            if (hls) {
                hls.destroy();
                hls = null;
            }

            const isHLS = sources[0].type === 'application/x-mpegURL';
            const videoUrl = sources[0].src;

            if (isHLS) {
                if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                    videoPlayer.src = videoUrl;
                } else if (Hls.isSupported()) {
                    hls = new Hls();
                    hls.loadSource(videoUrl);
                    hls.attachMedia(videoPlayer);
                } else {
                    alert('HLS não suportado neste navegador');
                    return;
                }
            } else {
                videoPlayer.src = videoUrl;
            }
        }

        function handleVideoEnd() {
            const current = playlistContainer.querySelector('.playlist-item.active');
            const next = current.nextElementSibling || playlistContainer.firstElementChild;
            if (next) loadVideo(next);
        }

        function addVideo() {
            const title = document.getElementById('videoTitle').value;
            const url = document.getElementById('videoUrl').value;
            const thumb = document.getElementById('videoThumb').value;

            if (title && url) {
                const isHLS = url.endsWith('.m3u8');
                const newItem = document.createElement('div');
                newItem.className = 'playlist-item';
                newItem.dataset.sources = JSON.stringify([{
                    src: url,
                    type: isHLS ? 'application/x-mpegURL' : 'video/mp4'
                }]);
                newItem.dataset.thumbnail = thumb || 'https://via.placeholder.com/80x45?text=No+Thumb';
                
                newItem.innerHTML = `
                    <img src="${thumb || 'https://via.placeholder.com/80x45?text=No+Thumb'}" alt="${title}">
                    <div>
                        <div>${title}</div>
                        <small>Clique para reproduzir</small>
                    </div>
                `;

                playlistContainer.appendChild(newItem);
                clearForm();
                document.getElementById('addVideoForm').classList.add('hidden');
            }
        }

        function clearForm() {
            document.getElementById('videoTitle').value = '';
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoThumb').value = '';
        }

        init();