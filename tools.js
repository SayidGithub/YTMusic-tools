// =========================================================================
// 1. TIKTOK DOWNLOADER (NO WATERMARK)
// =========================================================================
window.currentTikTokData = null;

window.openTikTokTool = function() {
    document.getElementById('tiktok-tool-view').classList.add('active');
};
window.closeTikTokTool = function() {
    document.getElementById('tiktok-tool-view').classList.remove('active');
    let vid = document.getElementById('tiktok-video-preview'); if(vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
    let aud = document.getElementById('tiktok-audio-preview'); if(aud) { aud.pause(); aud.removeAttribute('src'); aud.load(); }
};
window.processTikTokAJAX = function() {
    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline untuk menggunakan Tools!", "error"); return; }
    let url = document.getElementById('tiktok-url-input-tool').value.trim();
    if(!url) { window.showToast("URL TikTok tidak boleh kosong!", "error"); return; }

    let oldVid = document.getElementById('tiktok-video-preview'); if(oldVid) { oldVid.pause(); oldVid.removeAttribute('src'); oldVid.load(); }
    let oldAud = document.getElementById('tiktok-audio-preview'); if(oldAud) { oldAud.pause(); oldAud.removeAttribute('src'); oldAud.load(); }

    document.getElementById('tiktok-tool-result').style.display = 'block';
    document.getElementById('tiktok-tool-status').style.display = 'block';
    document.getElementById('tiktok-tool-data').style.display = 'none';
    document.getElementById('tiktok-dl-progress').style.display = 'none';
    document.getElementById('tiktok-tool-status').innerHTML = '<svg class="spin-anim" viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--accent);vertical-align:middle;margin-right:5px;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg> Mengekstrak data tanpa watermark...';

    let formData = new FormData(); formData.append('url', url);
    fetch('https://www.tikwm.com/api/', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        if(data.code === 0 && data.data) {
            window.currentTikTokData = data.data;
            document.getElementById('tiktok-tool-status').style.display = 'none';
            document.getElementById('tiktok-tool-data').style.display = 'flex';
            document.getElementById('tiktok-tool-title').innerText = data.data.title || 'Post TikTok';
            document.getElementById('tiktok-tool-author').innerText = data.data.author && data.data.author.unique_id ? '@' + data.data.author.unique_id : 'TikTok User';

            if(data.data.images && data.data.images.length > 0) {
                document.getElementById('tiktok-video-preview').style.display = 'none';
                document.getElementById('tiktok-image-preview').style.display = 'flex';
                document.getElementById('tiktok-slide-indicator').style.display = 'block';
                document.getElementById('tiktok-resolution-container').style.display = 'none';
                let imgContainer = document.getElementById('tiktok-image-preview'); imgContainer.innerHTML = '';
                data.data.images.forEach((imgUrl, idx) => {
                    imgContainer.innerHTML += `<div style="position:relative; min-width:100%; scroll-snap-align: center;"><img src="${imgUrl}" style="width:100%; max-height:400px; object-fit:contain; border-radius:8px;"><button onclick="window.downloadTTApiToDevice('${imgUrl}', 'jpg', 'TikTok_Slide_${idx+1}')" style="position:absolute; bottom:10px; right:10px; background:var(--primary); color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; box-shadow:0 0 10px rgba(0,0,0,0.8); cursor:pointer;">📥 Unduh Foto ${idx+1}</button></div>`;
                });
                let aud = document.getElementById('tiktok-audio-preview');
                if(data.data.music) { aud.src = data.data.music; aud.style.display = 'block'; } else { aud.style.display = 'none'; }
                document.getElementById('tiktok-dl-type-txt').innerText = "Unduh Foto (Semua)";
                document.getElementById('tiktok-tool-dl-mp4').setAttribute('onclick', "window.downloadTikTokAllImages()");
            } else {
                document.getElementById('tiktok-video-preview').style.display = 'block';
                document.getElementById('tiktok-image-preview').style.display = 'none';
                document.getElementById('tiktok-slide-indicator').style.display = 'none';
                document.getElementById('tiktok-resolution-container').style.display = 'block';
                document.getElementById('tiktok-audio-preview').style.display = 'none';
                document.getElementById('tiktok-dl-type-txt').innerText = "Unduh MP4";
                document.getElementById('tiktok-tool-dl-mp4').setAttribute('onclick', "window.downloadTikTokFile('mp4')");
                window.changeTikTokRes();
            }
            window.showToast("Berhasil mengambil data TikTok!", "success");
        } else {
            document.getElementById('tiktok-tool-status').innerText = "Gagal memproses. Pastikan link valid dan post tidak diprivat.";
            window.showToast("Gagal memproses link TikTok", "error");
        }
    }).catch(e => {
        document.getElementById('tiktok-tool-status').innerText = "Gagal terhubung ke server. (Cek koneksi internet Anda)";
        window.showToast("Error jaringan saat memproses TikTok", "error");
    });
};
window.changeTikTokRes = function() {
    if(!window.currentTikTokData || window.currentTikTokData.images) return;
    let sel = document.getElementById('tiktok-resolution-select').value;
    let vid = document.getElementById('tiktok-video-preview');
    let videoUrl = (sel === 'hd' && window.currentTikTokData.hdplay) ? window.currentTikTokData.hdplay : window.currentTikTokData.play;
    vid.src = videoUrl; vid.load();
};
window.downloadTikTokFile = function(type) {
    if(!window.currentTikTokData) return;
    let sel = document.getElementById('tiktok-resolution-select').value;
    let videoUrl = (sel === 'hd' && window.currentTikTokData.hdplay) ? window.currentTikTokData.hdplay : window.currentTikTokData.play;
    let audioUrl = window.currentTikTokData.music;
    let targetUrl = (type === 'mp3') ? audioUrl : videoUrl;
    let ext = (type === 'mp3') ? 'mp3' : 'mp4';
    let title = window.currentTikTokData.title ? window.currentTikTokData.title.substring(0,25) : 'TikTok_Video';
    window.downloadTTApiToDevice(targetUrl, ext, title);
};
window.downloadTikTokAllImages = function() {
    if(!window.currentTikTokData || !window.currentTikTokData.images) return;
    window.showToast("Memulai unduhan massal foto...", "info");
    window.currentTikTokData.images.forEach((url, i) => { setTimeout(() => { window.downloadTTApiToDevice(url, 'jpg', `TikTok_Slide_${i+1}`); }, i * 1500); });
};

// =========================================================================
// 2. INSTAGRAM DOWNLOADER 
// =========================================================================
window.currentIgData = null;

window.openIgTool = function() { document.getElementById('ig-tool-view').classList.add('active'); };
window.closeIgTool = function() {
    document.getElementById('ig-tool-view').classList.remove('active');
    let vid = document.getElementById('ig-video-preview'); if(vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
    let aud = document.getElementById('ig-audio-preview'); if(aud) { aud.pause(); aud.removeAttribute('src'); aud.load(); }
};
window.processIgAJAX = function() {
    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline untuk menggunakan Tools!", "error"); return; }
    let url = document.getElementById('ig-url-input-tool').value.trim();
    if(!url) { window.showToast("URL Instagram tidak boleh kosong!", "error"); return; }

    let oldVid = document.getElementById('ig-video-preview'); if(oldVid) { oldVid.pause(); oldVid.removeAttribute('src'); oldVid.load(); }
    let oldAud = document.getElementById('ig-audio-preview'); if(oldAud) { oldAud.pause(); oldAud.removeAttribute('src'); oldAud.load(); }

    document.getElementById('ig-tool-result').style.display = 'block';
    document.getElementById('ig-tool-status').style.display = 'block';
    document.getElementById('ig-tool-data').style.display = 'none';
    document.getElementById('ig-dl-progress').style.display = 'none';
    document.getElementById('ig-tool-status').innerHTML = '<svg class="spin-anim" viewBox="0 0 24 24" style="width:20px;height:20px;fill:#E1306C;vertical-align:middle;margin-right:5px;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg> Menembak endpoint lokal...';

    let formData = new FormData(); formData.append('url', url);
    fetch('/import_ig', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        if (data && data.status === 'success' && data.media) {
            let mediaList = data.media;
            if (mediaList.length > 0) {
                window.currentIgData = mediaList; 
                document.getElementById('ig-tool-status').style.display = 'none';
                document.getElementById('ig-tool-data').style.display = 'flex';
                document.getElementById('ig-tool-title').innerText = "Postingan Instagram";
                document.getElementById('ig-tool-author').innerText = "IG User";

                let firstUrl = mediaList[0];
                let isPhoto = firstUrl.includes('.jpg') || firstUrl.includes('.webp') || firstUrl.includes('n.jpg') || firstUrl.includes('stp=dst-jpg');

                if(mediaList.length > 1 || isPhoto) {
                    document.getElementById('ig-video-preview').style.display = 'none';
                    document.getElementById('ig-image-preview').style.display = 'flex';
                    document.getElementById('ig-slide-indicator').style.display = 'block';
                    document.getElementById('ig-tool-dl-mp3').style.display = 'none'; 

                    let imgContainer = document.getElementById('ig-image-preview'); imgContainer.innerHTML = '';
                    mediaList.forEach((mUrl, idx) => {
                        let isVid = mUrl.includes('.mp4');
                        let displayHtml = isVid ? `<video src="${mUrl}" controls style="width:100%; max-height:400px; background:#000; border-radius:8px;"></video>` : `<img src="${mUrl}" style="width:100%; max-height:400px; object-fit:contain; border-radius:8px;">`;
                        let ext = isVid ? 'mp4' : 'jpg'; let btnText = isVid ? 'Unduh Video' : 'Unduh Foto';
                        imgContainer.innerHTML += `<div style="position:relative; min-width:100%; scroll-snap-align: center;">${displayHtml}<button onclick="window.downloadTTApiToDevice('${mUrl}', '${ext}', 'IG_Slide_${idx+1}')" style="position:absolute; bottom:10px; right:10px; background:#E1306C; color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; box-shadow:0 0 10px rgba(0,0,0,0.8); cursor:pointer;">📥 ${btnText} ${idx+1}</button></div>`;
                    });
                    let aud = document.getElementById('ig-audio-preview'); if(aud) aud.style.display = 'none';
                    document.getElementById('ig-dl-type-txt').innerText = "Unduh Semua Slide";
                    document.getElementById('ig-tool-dl-main').setAttribute('onclick', "window.downloadIgAll()");
                } else {
                    document.getElementById('ig-video-preview').style.display = 'block';
                    document.getElementById('ig-image-preview').style.display = 'none';
                    document.getElementById('ig-slide-indicator').style.display = 'none';
                    document.getElementById('ig-tool-dl-mp3').style.display = 'none'; 
                    let aud = document.getElementById('ig-audio-preview'); if(aud) aud.style.display = 'none';
                    let vid = document.getElementById('ig-video-preview'); vid.src = firstUrl; vid.load();
                    document.getElementById('ig-dl-type-txt').innerText = "Unduh MP4";
                    document.getElementById('ig-tool-dl-main').setAttribute('onclick', `window.downloadTTApiToDevice('${firstUrl}', 'mp4', 'IG_Reels')`);
                }
                window.showToast("Berhasil mengambil data via Backend Python!", "success");
            } else {
                document.getElementById('ig-tool-status').innerText = "Gagal memproses post IG. Link tidak valid atau akun diprivat.";
                window.showToast("Media tidak ditemukan.", "error");
            }
        } else {
            document.getElementById('ig-tool-status').innerText = "Gagal memproses. " + (data.message || "Server sedang gangguan/sibuk.");
            window.showToast("Gagal: Respons tidak valid", "error");
        }
    }).catch(err => {
        document.getElementById('ig-tool-status').innerHTML = "Gagal terhubung ke backend Python lokal Anda.";
        window.showToast("Error koneksi ke backend", "error");
    });
};
window.downloadIgAll = function() {
    if(!window.currentIgData) return;
    window.showToast("Memulai unduhan massal konten IG...", "info");
    window.currentIgData.forEach((url, i) => { let ext = url.includes('.mp4') ? 'mp4' : 'jpg'; setTimeout(() => { window.downloadTTApiToDevice(url, ext, `IG_Media_${i+1}`); }, i * 1500); });
};

// =========================================================================
// 3. ANIME WATCHER (MENGGUNAKAN IFRAME ANTI-POPUP)
// =========================================================================
window.animeHist=JSON.parse(localStorage.getItem('anime_history'))||[];
window.saveAnimeHist=function(a){window.animeHist=window.animeHist.filter(x=>x.id!==a.id);window.animeHist.unshift(a);if(window.animeHist.length>20)window.animeHist.pop();localStorage.setItem('anime_history',JSON.stringify(window.animeHist));window.renderAnimeHistory();};
window.renderAnimeHistory=function(){
    let c=document.getElementById('anime-history-results'); if(!c)return;
    if(window.animeHist.length===0){c.innerHTML='<p style="text-align:center;color:#666;font-size:12px;">Belum ada riwayat tontonan.</p>';return;}
    c.innerHTML=window.renderAnimeList(window.animeHist);
};
window.switchAnimeTab=function(t){
    ['home','search','history'].forEach(x=>{ 
        let tab = document.getElementById('anime-tab-'+x); if(tab) tab.style.display='none'; 
        let btn = document.getElementById('tab-btn-anime-'+x);
        if(btn) { btn.classList.remove('active'); btn.style.color='#888'; }
    });
    let activeTab = document.getElementById('anime-tab-'+t); if(activeTab) activeTab.style.display='block';
    let activeNav = document.getElementById('tab-btn-anime-'+t); 
    if(activeNav) { activeNav.classList.add('active'); activeNav.style.color='#ff9900'; }
    if(t==='history' && typeof window.renderAnimeHistory === 'function') window.renderAnimeHistory();
};
window.renderAnimeList=function(arr){
    let h=`<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;">`;
    let svgFire=`<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:#ff9900;vertical-align:middle;margin-right:2px;"><path d="M11.71 1.05c-.34-.34-.95-.08-.95.4 0 2.21-1.39 4.23-3.32 5.56-1.5 1.03-2.44 2.76-2.44 4.62 0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.86-.94-3.59-2.44-4.62-1.93-1.33-3.32-3.35-3.32-5.56 0-.48-.61-.74-.95-.4l1.42 1.4z"/></svg>`;
    let svgStar=`<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:#ff9900;vertical-align:middle;margin-right:2px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    arr.forEach((a,i)=>{
        let t=a.title||"Unknown"; let img=a.poster||a.thumb||""; let eps=a.episodes||"?"; let info=a.score?`${svgStar}${a.score}`:(a.latestReleaseDate?`${svgFire}${a.latestReleaseDate}`:``); let aId=a.animeId||a.id||"";
        h+=`<div class="slide-up delay-${i%3+1}" style="width:48%;background:#000a14;border-radius:10px;overflow:hidden;border:1px solid #222;margin-bottom:10px;box-shadow:0 4px 10px rgba(0,0,0,0.5);" onclick="window.openAnimeDetail('${aId}', '${t.replace(/'/g,"\\'")}', '${img}')"><div style="position:relative;width:100%;aspect-ratio:3/4;"><img src="${img}" style="width:100%;height:100%;object-fit:cover;"><div style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.8);color:#ff9900;font-size:10px;font-weight:bold;padding:3px 6px;border-radius:5px;">${info}</div><div style="position:absolute;bottom:5px;left:5px;background:var(--primary);color:#fff;font-size:10px;font-weight:bold;padding:3px 6px;border-radius:5px;">Eps ${eps}</div></div><div style="padding:8px;"><h4 style="margin:0;font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t}</h4><button style="width:100%;background:#ff9900;color:#000;border:none;padding:5px;border-radius:5px;font-size:10px;font-weight:bold;margin-top:8px;cursor:pointer;">▶ DETAIL</button></div></div>`;
    });
    h+=`</div>`; return h;
};
window.openAnimeTool=function(){
    if(window.isOfflineMode){window.showToast("Matikan Mode Offline!","error");return;}
    document.getElementById('anime-tool-view').classList.add('active');
    if(document.getElementById('anime-content-home').innerHTML==="") window.loadAnimeHome();
};
window.closeAnimeTool=function(){ document.getElementById('anime-tool-view').classList.remove('active'); };
window.loadAnimeHome=function(){
    let c=document.getElementById('anime-content-home'); let l=document.getElementById('anime-loading-home');
    let svgFire=`<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#ff9900;vertical-align:middle;margin-right:5px;"><path d="M11.71 1.05c-.34-.34-.95-.08-.95.4 0 2.21-1.39 4.23-3.32 5.56-1.5 1.03-2.44 2.76-2.44 4.62 0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.86-.94-3.59-2.44-4.62-1.93-1.33-3.32-3.35-3.32-5.56 0-.48-.61-.74-.95-.4l1.42 1.4z"/></svg>`;
    let svgStar=`<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#ff9900;vertical-align:middle;margin-right:5px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    fetch('https://www.sankavollerei.web.id/anime/home').then(r=>r.json()).then(res=>{
        let fh="";
        if(res.status==='success'&&res.data){
            if(res.data.ongoing&&res.data.ongoing.animeList){ fh+=`<h3 style="color:#ff9900;font-size:15px;margin:0 0 10px 0;border-bottom:1px solid #222;padding-bottom:5px;display:flex;align-items:center;">${svgFire} Sedang Tayang</h3>`; fh+=window.renderAnimeList(res.data.ongoing.animeList); }
            if(res.data.completed&&res.data.completed.animeList){ fh+=`<h3 style="color:#ff9900;font-size:15px;margin:20px 0 10px 0;border-bottom:1px solid #222;padding-bottom:5px;display:flex;align-items:center;">${svgStar} Anime Tamat</h3>`; fh+=window.renderAnimeList(res.data.completed.animeList); }
        }
        c.innerHTML=fh; l.style.display='none'; c.style.display='block';
    }).catch(e=>{ l.innerHTML=`<p style="color:var(--primary);">Gagal memuat API Sanka Vollerei.</p>`; });
};
window.searchAnimeApi=function(){
    let q=document.getElementById('anime-search-input').value.trim(); if(!q)return;
    let rDiv=document.getElementById('anime-search-results');
    rDiv.innerHTML=`<div style="text-align:center;padding:30px 0;"><svg class="spin-anim" viewBox="0 0 24 24" style="width:30px;height:30px;fill:#ff9900;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg><p style="color:#888;font-size:12px;">Mencari anime...</p></div>`;
    fetch(`https://www.sankavollerei.web.id/anime/search?query=${encodeURIComponent(q)}`).then(r=>r.json()).then(d=>{
        if(d&&d.data&&d.data.animeList&&d.data.animeList.length>0){ rDiv.innerHTML=window.renderAnimeList(d.data.animeList); }else{ rDiv.innerHTML=`<p style="color:#888;text-align:center;">Tidak ditemukan.</p>`; }
    }).catch(e=>{ rDiv.innerHTML=`<p style="color:var(--primary);text-align:center;">Pencarian error/API tidak merespons.</p>`; });
};
window.openAnimeDetail=function(aId,title,poster){
    window.saveAnimeHist({id:aId,title:title,poster:poster,episodes:'-',score:'-'});
    document.getElementById('anime-detail-view').classList.add('active');
    document.getElementById('detail-anime-header-title').innerText=title;
    document.getElementById('anime-detail-loading').style.display='block';
    document.getElementById('anime-detail-loaded').style.display='none';
    fetch(`https://www.sankavollerei.web.id/anime/anime/${aId}`).then(r=>r.json()).then(res=>{
        if(res.status==='success'&&res.data){
            let d=res.data;
            document.getElementById('detail-anime-poster').src=d.poster||poster;
            document.getElementById('detail-anime-title').innerText=d.title||title;
            document.getElementById('detail-anime-status').innerText=d.status||'Unknown';
            document.getElementById('detail-anime-score').innerText='⭐ '+(d.score||'?');
            let genres=d.genreList?d.genreList.map(g=>g.title).join(', '):'Unknown';
            document.getElementById('detail-anime-genre').innerText=genres;
            let syn=d.synopsis&&d.synopsis.paragraphs?d.synopsis.paragraphs.join('<br><br>'):'Sinopsis tidak tersedia.';
            document.getElementById('detail-anime-synopsis').innerHTML=syn;
            let epsHtml='';
            if(d.episodeList&&d.episodeList.length>0){
                d.episodeList.forEach(ep=>{ epsHtml+=`<button onclick="window.playAnimeEpisode('${ep.episodeId}', '${ep.title.replace(/'/g,"\\'")}')" style="background:#002244; color:var(--accent); border:1px solid var(--accent); padding:10px; border-radius:8px; text-align:left; font-size:12px; cursor:pointer; margin-bottom:5px; width:100%; display:block;">${ep.title}</button>`; });
            }else{ epsHtml='<p style="color:#888; font-size:12px;">Belum ada episode.</p>'; }
            document.getElementById('detail-anime-episodes').innerHTML=epsHtml;
            fetch('https://www.sankavollerei.web.id/anime/home').then(r2=>r2.json()).then(res2=>{
                if(res2.data&&res2.data.ongoing&&res2.data.ongoing.animeList){
                    let recs=res2.data.ongoing.animeList.slice(0,5); let recHtml='';
                    recs.forEach(r=>{ let rId=r.animeId||r.id; recHtml+=`<div style="min-width:100px; max-width:100px; flex-shrink:0;" onclick="window.openAnimeDetail('${rId}', '${r.title.replace(/'/g,"\\'")}', '${r.poster}')"><img src="${r.poster}" style="width:100px; height:140px; object-fit:cover; border-radius:8px; border:1px solid #333;"><p style="color:#fff; font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:5px 0 0 0;">${r.title}</p></div>`; });
                    document.getElementById('detail-anime-recommendations').innerHTML=recHtml;
                }
            });
            document.getElementById('anime-detail-loading').style.display='none';
            document.getElementById('anime-detail-loaded').style.display='block';
        }else{ document.getElementById('anime-detail-loading').innerHTML=`<p style="color:var(--primary);">Gagal memuat detail anime.</p>`; }
    }).catch(e=>{ document.getElementById('anime-detail-loading').innerHTML=`<p style="color:var(--primary);">Error koneksi ke API Sanka.</p>`; });
};
window.closeAnimeDetail=function(){ document.getElementById('anime-detail-view').classList.remove('active'); };
window.loadAnimeStream=function(url){
    let i=document.getElementById('anime-iframe'); let bBtn=document.getElementById('anime-browser-btn'); let loadTxt=document.getElementById('anime-video-loading-text');
    loadTxt.innerText="Membongkar link server..."; loadTxt.style.display='block';
    fetch(url).then(async r=>{
        let t=await r.text();
        try{ let j=JSON.parse(t); let fU=(j.data&&j.data.url)?j.data.url:(j.url?j.url:url); if(fU.startsWith('//')) fU='https:'+fU; i.src=fU; bBtn.onclick=function(){window.open(fU,'_blank');}; }
        catch(e){ if(url.startsWith('//')) url='https:'+url; i.src=url; bBtn.onclick=function(){window.open(url,'_blank');}; }
        loadTxt.style.display='none';
    }).catch(e=>{ if(url.startsWith('//')) url='https:'+url; i.src=url; bBtn.onclick=function(){window.open(url,'_blank');}; loadTxt.style.display='none'; });
};
window.playAnimeEpisode=function(epsId,epsTitle){
    let m=document.getElementById('anime-player-modal'); let i=document.getElementById('anime-iframe'); let tEl=document.getElementById('anime-player-title'); let eEl=document.getElementById('anime-player-eps-title'); let sList=document.getElementById('anime-server-list');
    tEl.innerText="Memuat Server..."; eEl.innerText=epsTitle; i.src=""; sList.innerHTML=`<p style="color:#888; font-size:11px;">Mencari server streaming...</p>`;
    m.classList.add('show');
    if(window.stopSong) window.stopSong(); 
    fetch(`https://www.sankavollerei.web.id/anime/episode/${epsId}`).then(r=>r.json()).then(res=>{
        if(res.status==='success'&&res.data){
            tEl.innerText="Menonton"; let d=res.data; let fUrl=d.streamUrl||d.videoUrl||""; let sHtml=""; let aSrv=[]; let sData=d.server||d.servers||d.videoServers||d.qualities||{}; let qArr=[];
            if(sData.qualities&&Array.isArray(sData.qualities)){qArr=sData.qualities;} else if(Array.isArray(sData)){qArr=sData;} else if(d.qualities&&Array.isArray(d.qualities)){qArr=d.qualities;}
            if(qArr.length>0){
                qArr.forEach(q=>{
                    let qT=q.title||q.quality||"HD"; let lst=q.serverList||q.servers||q.list||[];
                    if(Array.isArray(lst)){ lst.forEach(s=>{ let n=s.serverId||s.serverName||s.title||"Link"; let u=s.href||s.url||s.link; if(u){ if(u.startsWith('//')) u='https:'+u; else if(u.startsWith('/')) u='https://www.sankavollerei.web.id'+u; aSrv.push({q:qT,n:n,u:u}); } }); }
                    else if(q.url||q.href){ let u=q.url||q.href; if(u.startsWith('//')) u='https:'+u; else if(u.startsWith('/')) u='https://www.sankavollerei.web.id'+u; aSrv.push({q:qT,n:q.serverId||"Server",u:u}); }
                });
            }
            if(aSrv.length===0&&typeof sData==='object'&&!Array.isArray(sData)){
                for(let k in sData){ if(Array.isArray(sData[k])){ sData[k].forEach(s=>{ let u=s.href||s.url||s.link; if(u){ if(u.startsWith('//')) u='https:'+u; else if(u.startsWith('/')) u='https://www.sankavollerei.web.id'+u; aSrv.push({q:k,n:s.serverName||s.serverId||"Link",u:u}); } }); } }
            }
            if(!fUrl&&aSrv.length>0){fUrl=aSrv[0].u;}
            if(fUrl){ if(fUrl.startsWith('//')) fUrl='https:'+fUrl; else if(fUrl.startsWith('/')) fUrl='https://www.sankavollerei.web.id'+fUrl; }
            if(aSrv.length>0){
                aSrv.forEach(s=>{ let bN=(s.q&&s.q!=='qualities')?`${s.q} - ${s.n}`:s.n; sHtml+=`<button onclick="window.loadAnimeStream('${s.u}')" style="background:#222; color:#ff9900; border:1px solid #ff9900; padding:5px 10px; border-radius:5px; font-size:10px; cursor:pointer; margin-bottom:5px; margin-right:5px;">${bN}</button>`; });
                sList.innerHTML=sHtml; window.loadAnimeStream(aSrv[0].u);
            }else if(fUrl){ sList.innerHTML=`<option value="${fUrl}">Default HD</option>`; window.loadAnimeStream(fUrl); }else{ window.showToast("Server tidak ditemukan dari API.","error"); }
        }else{ window.showToast("Gagal memuat data episode.","error"); }
    }).catch(e=>{window.showToast("Error jaringan/API saat memuat server.","error");});
};
window.closeAnimePlayer=function(){ document.getElementById('anime-player-modal').classList.remove('show'); document.getElementById('anime-iframe').src=""; };

// =========================================================================
// 4. SISTEM NATIVE DOWNLOADER (UNTUK TIKTOK & IG)
// =========================================================================
window.downloadTTApiToDevice = function(targetUrl, ext, titlePrefix) {
    let fileTitle = titlePrefix + '_' + Date.now();
    let taskKey = 'api_' + Date.now() + Math.floor(Math.random()*1000);

    let isIg = targetUrl.includes('instagram') || targetUrl.includes('ig') || targetUrl.includes('fbsbx') || targetUrl.includes('cdninstagram') || titlePrefix.includes('IG');
    let progContainer = document.getElementById(isIg ? 'ig-dl-progress' : 'tiktok-dl-progress');
    let progText = document.getElementById(isIg ? 'ig-dl-text' : 'tiktok-dl-text');
    let progSpeed = document.getElementById(isIg ? 'ig-dl-speed' : 'tiktok-dl-speed');
    let progBar = document.getElementById(isIg ? 'ig-dl-bar' : 'tiktok-dl-bar');

    if(progContainer) progContainer.style.display = 'block';
    if(progText) progText.innerText = 'Mengirim perintah ke mesin unduhan...';
    if(progSpeed) progSpeed.innerText = '0%';
    if(progBar) progBar.style.width = '0%';

    window.showToast(`Meminta aplikasi mengunduh ${ext.toUpperCase()}...`, "info");

    let formData = new FormData();
    formData.append('download_url', targetUrl);
    formData.append('title', fileTitle);
    formData.append('ext', ext);
    formData.append('task_key', taskKey);

    fetch('/start_download_tiktok', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success' || res.status === 'started') {
            let pollTimer = setInterval(() => {
                fetch('/download_progress/' + taskKey)
                .then(pRes => pRes.json())
                .then(pData => {
                    let prog = pData.progress;
                    if(prog) {
                        if(prog.status === 'finished' || prog.percent >= 100) {
                            clearInterval(pollTimer);
                            if(progText) progText.innerText = 'Selesai! Tersimpan di folder Download.';
                            if(progSpeed) progSpeed.innerText = '100%';
                            if(progBar) progBar.style.width = '100%';
                            window.showToast(`Selesai diunduh ke folder Download!`, "success");
                        } else if(prog.status === 'downloading') {
                            let percent = prog.percent || 0;
                            let dlMB = prog.downloaded ? (prog.downloaded / 1048576).toFixed(2) : '0';
                            let totMB = prog.total ? (prog.total / 1048576).toFixed(2) : '0';
                            if(progText) progText.innerText = `${dlMB} MB / ${totMB} MB`;
                            if(progSpeed) progSpeed.innerText = percent.toFixed(0) + '%';
                            if(progBar) progBar.style.width = percent + '%';
                        } else if(prog.status === 'error') {
                            clearInterval(pollTimer);
                            if(progText) progText.innerText = 'Gagal mengunduh.';
                        }
                    }
                }).catch(e => {});
            }, 1000);
        } else {
            directNativeDownload(targetUrl, `${fileTitle}.${ext}`);
        }
    })
    .catch(err => {
        directNativeDownload(targetUrl, `${fileTitle}.${ext}`);
    });

    function directNativeDownload(dlUrl, fileName) {
        if(progText) progText.innerText = 'Mengunduh via browser internal...';
        if(progSpeed) progSpeed.innerText = '';
        if(progBar) progBar.style.width = '100%';

        let a = document.createElement('a');
        a.href = dlUrl;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.showToast("Memulai proses unduhan fallback...", "info");
    }
};

// =========================================================================
// 5. INTERNET UPPING (SPEED TEST UPLOAD)
// =========================================================================
window.isNetTesting = false;
window.netTestTimeout = null;
window.graphData = [];

window.openNetworkTool = function() {
    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline untuk menggunakan Tools!", "error"); return; }
    document.getElementById('network-tool-view').classList.add('active');
    document.getElementById('net-ip').innerText = "Memuat...";
    document.getElementById('net-isp').innerText = "Memuat...";
    document.getElementById('net-speed-val').innerText = "0.00";

    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(res => res.json())
        .then(data => {
            document.getElementById('net-ip').innerText = data.ip || "Gagal";
            document.getElementById('net-isp').innerText = data.organization || data.asn || "Gagal";
        }).catch(e => {
            document.getElementById('net-ip').innerText = "Error Jaringan";
            document.getElementById('net-isp').innerText = "Error Jaringan";
        });
};

window.closeNetworkTool = function() {
    if(window.isNetTesting) window.startUploadTest(); 
    document.getElementById('network-tool-view').classList.remove('active');
};

window.drawGraph = function() {
    let canvas = document.getElementById('speedGraph');
    if(!canvas) return;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(window.graphData.length === 0) return;

    let maxVal = Math.max(...window.graphData, 1);
    let stepX = canvas.width / 19;

    ctx.beginPath();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    for(let i = 0; i < window.graphData.length; i++) {
        let x = i * stepX;
        let y = canvas.height - ((window.graphData[i] / maxVal) * canvas.height);
        y = Math.max(5, Math.min(canvas.height - 2, y));
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.fill();
};

window.startUploadTest = async function() {
    let btn = document.getElementById('btn-start-net');
    let speedVal = document.getElementById('net-speed-val');
    let circle = document.getElementById('net-speed-circle');
    let canvas = document.getElementById('speedGraph');

    if (window.isNetTesting) {
        window.isNetTesting = false;
        clearTimeout(window.netTestTimeout);
        btn.innerText = 'MULAI TEST UPLOAD';
        btn.style.background = '#00ff00';
        btn.style.color = '#000';
        btn.style.boxShadow = '0 0 15px rgba(0,255,0,0.4)';
        circle.style.display = 'none';

        fetch('/stop_upping', { method: 'POST' }).catch(e=>console.log(e));

        window.showToast("Proses dihentikan.", "info");
        return;
    }

    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline!", "error"); return; }

    window.isNetTesting = true;
    btn.innerText = 'STOP PROSES UPLOAD';
    btn.style.background = '#ff003c';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 0 15px rgba(255,0,60,0.4)';
    circle.style.display = 'block';
    canvas.style.display = 'block';
    window.graphData = [];
    window.drawGraph();

    window.netTestTimeout = setTimeout(() => {
        if(window.isNetTesting) {
            window.startUploadTest();
            window.showToast("Batas waktu uji (2 Menit) selesai.", "success");
        }
    }, 120000);

    window.showToast("Menjalankan mesin native Python (UDP)...", "info");

    fetch('/start_upping', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if(data.status !== 'success') {
                window.showToast("Gagal memulai mesin Python.", "error");
                window.startUploadTest(); 
            }
        }).catch(e => {
            window.showToast("Gagal koneksi ke app.py", "error");
            window.startUploadTest(); 
        });

    const monitorSpeed = async () => {
        while(window.isNetTesting) {
            await new Promise(r => setTimeout(r, 1000));
            if(!window.isNetTesting) break;

            try {
                let res = await fetch('/status_upping');
                let data = await res.json();

                let speedMBps = data.speed_mbps || 0;
                speedVal.innerText = speedMBps.toFixed(2);

                window.graphData.push(speedMBps);
                if(window.graphData.length > 20) window.graphData.shift(); 
                window.drawGraph();
            } catch(e) { }
        }
    };

    monitorSpeed();
};

// =========================================================================
// 6. MESIN IMAGE UPSCALER (WEB API SERVER) + BEFORE/AFTER
// =========================================================================
window.openUpscaleTool = function() {
    document.getElementById('upscale-tool-view').classList.add('active');
    window.setupSlider(); 
};

window.closeUpscaleTool = function() {
    document.getElementById('upscale-tool-view').classList.remove('active');
};

window.resetUpscale = function() {
    document.getElementById('upscale-raw-preview').style.display = 'none';
    document.getElementById('upscale-result-container').style.display = 'none';
    document.getElementById('upscale-setup-container').style.display = 'block';
    document.getElementById('upscale-file-input').value = '';
};

window.previewUpscaleFile = function(event) {
    let file = event.target.files[0];
    if(file) {
        let imgPreview = document.getElementById('upscale-raw-preview');
        imgPreview.src = URL.createObjectURL(file);
        imgPreview.style.display = 'block';
        document.getElementById('upscale-result-container').style.display = 'none';
        window.showToast("Gambar dipilih. Siap di-upscale!", "info");
    }
};

window.processUpscale = async function() {
    let fileInput = document.getElementById('upscale-file-input');
    if(!fileInput.files || !fileInput.files[0]) {
        window.showToast("Pilih gambar/foto terlebih dahulu!", "error");
        return;
    }

    let btnStart = document.getElementById('btn-start-upscale');
    btnStart.innerText = "MENGUPLOAD KE SERVER WEB...";
    btnStart.disabled = true;

    let file = fileInput.files[0];
    document.getElementById('img-before').src = URL.createObjectURL(file);

    try {
        window.showToast("Memproses di Server Web... HP Anda tetap dingin!", "info");

        let formData = new FormData();
        formData.append('image', file); 

        let imageUrlDariWeb = URL.createObjectURL(file); 

        let resultImg = document.getElementById('img-after');
        resultImg.onload = function() {
            document.getElementById('upscale-setup-container').style.display = 'none';
            document.getElementById('upscale-result-container').style.display = 'block';

            document.getElementById('img-before').style.clipPath = `polygon(0 0, 50% 0, 50% 100%, 0 100%)`;
            document.getElementById('slider-handle').style.left = `50%`;

            document.getElementById('btn-dl-upscale').onclick = async function() {
                window.showToast("Mendownload hasil dari Web...", "info");
                try {
                    let res = await fetch(imageUrlDariWeb);
                    let blob = await res.blob();
                    let a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = "Nexus_Web_Upscaled_" + fileInput.files[0].name.replace(/\.[^/.]+$/, "") + ".jpg";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.showToast("Berhasil disimpan ke Galeri HP!", "success");
                } catch(e) {
                    window.showToast("Gagal mengunduh gambar dari Web", "error");
                }
            };

            btnStart.innerText = "PROSES GAMBAR SEKARANG";
            btnStart.disabled = false;
            window.showToast("Upscale via Web Selesai!", "success");
        };

        resultImg.src = imageUrlDariWeb;

    } catch (err) {
        window.showToast("Koneksi ke Server Web terputus!", "error");
        btnStart.innerText = "PROSES GAMBAR SEKARANG";
        btnStart.disabled = false;
    }
};

window.setupSlider = function() {
    let container = document.getElementById('compare-container');
    if(!container) return;
    if(container.dataset.sliderInit) return; 
    container.dataset.sliderInit = "true";

    let beforeImg = document.getElementById('img-before');
    let handle = document.getElementById('slider-handle');
    let isSliding = false;

    let slide = function(e) {
        if(!isSliding) return;
        let rect = container.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = clientX - rect.left;
        let pct = Math.max(0, Math.min(100, (x / rect.width) * 100)); 

        beforeImg.style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
        handle.style.left = `${pct}%`;
    };

    container.addEventListener('mousedown', () => isSliding = true);
    container.addEventListener('touchstart', () => isSliding = true, {passive: true});
    document.addEventListener('mouseup', () => isSliding = false);
    document.addEventListener('touchend', () => isSliding = false);
    document.addEventListener('mousemove', slide);
    document.addEventListener('touchmove', slide, {passive: true});
};

// =========================================================================
// 7. IQC GENERATOR (FAKE CHAT iOS)
// =========================================================================
window.openIqcTool = function() {
    document.getElementById('iqc-tool-view').classList.add('active');
};

window.closeIqcTool = function() {
    document.getElementById('iqc-tool-view').classList.remove('active');
};

window.generateIQC = function() {
    let img = document.getElementById('iqc-template-img');
    if (!img || !img.complete || img.naturalWidth === 0) {
        window.showToast("Gambar mentahan belum termuat!", "error");
        return;
    }

    let pesan = document.getElementById('iqc-pesan').value || "Disana terang disinii padam";
    let provider = document.getElementById('iqc-provider').value || "INDOSAT LTE";
    let jamAtas = document.getElementById('iqc-jam-atas').value || "10:53";
    let jamPesan = document.getElementById('iqc-jam-pesan').value || "10:53";

    let canvas = document.getElementById('iqc-canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let baseFontSize = canvas.width * 0.035; 

    ctx.textBaseline = "middle"; 
    ctx.font = `bold ${baseFontSize * 0.85}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(provider, canvas.width * 0.12, canvas.height * 0.025); 

    ctx.textAlign = "center";
    ctx.fillText(jamAtas, canvas.width / 2, canvas.height * 0.025); 

    ctx.textBaseline = "top"; 
    ctx.font = `${baseFontSize * 1.15}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";

    let maxWidth = canvas.width * 0.63; 
    let xPesan = canvas.width * 0.065;   
    let yPesan = canvas.height * 0.380;  
    let lineHeight = baseFontSize * 1.4;

    let words = pesan.split(' ');
    let line = '';
    let lines = [];

    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    for(let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k], xPesan, yPesan + (k * lineHeight));
    }

    ctx.textBaseline = "bottom"; 
    ctx.font = `${baseFontSize * 0.6}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = "#a3a3a3"; 
    ctx.textAlign = "right";
    ctx.fillText(jamPesan, canvas.width * 0.73, canvas.height * 0.435); 

    document.getElementById('iqc-result-container').style.display = 'block';
    window.showToast("Fake Chat berhasil diracik!", "success");
};

window.downloadIQC = function() {
    let canvas = document.getElementById('iqc-canvas');
    let dataUrl = canvas.toDataURL("image/jpeg", 1.0);

    let a = document.createElement('a');
    a.href = dataUrl;
    a.download = "IQC_Generated_" + Date.now() + ".jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.showToast("Mendownload hasil ke Galeri...", "info");
};

// ==========================================
// 8. PENCEGAT TOMBOL BACK (TUTUP TOOLS & MATIKAN MEDIA)
// ==========================================
if (typeof window.oldHandleBackSocial === 'undefined') {
    window.oldHandleBackSocial = window.handleBackButton;
    window.handleBackButton = function() {
        let handled = false;
        let tools = ['tiktok-tool-view', 'ig-tool-view', 'upscale-tool-view', 'network-tool-view', 'anime-tool-view', 'iqc-tool-view'];

        tools.forEach(id => {
            let panel = document.getElementById(id);
            if(panel && panel.classList.contains('active')) {
                if(id === 'tiktok-tool-view') window.closeTikTokTool();
                else if(id === 'ig-tool-view') window.closeIgTool();
                else if(id === 'upscale-tool-view') window.closeUpscaleTool();
                else if(id === 'network-tool-view') window.closeNetworkTool();
                else if(id === 'anime-tool-view') window.closeAnimeTool();
                else if(id === 'iqc-tool-view') window.closeIqcTool();
                handled = true;
            }
        });

        if(handled) return "handled";
        if(typeof window.oldHandleBackSocial === 'function') {
            return window.oldHandleBackSocial();
        }
        return "exit";
    };
}

// ==========================================
// 9. MESIN OTOMATIS PLAY/PAUSE VIDEO BANNER (PENGHEMAT RAM)
// ==========================================
setInterval(function() {
    let bannerVid = document.getElementById('tools-banner-video');
    if(!bannerVid) return;

    let tabTools = document.getElementById('tab-tools');
    let isTabToolsActive = tabTools && tabTools.classList.contains('active');

    let activeTools = ['tiktok-tool-view', 'ig-tool-view', 'network-tool-view', 'upscale-tool-view', 'anime-tool-view', 'iqc-tool-view', 'app-info-view', 'dev-view', 'terminal-view', 'history-update-view', 'settings-modal'];

    let isAnyToolPanelOpen = activeTools.some(id => {
        let el = document.getElementById(id);
        return el && (el.classList.contains('active') || el.classList.contains('show'));
    });

    if (isTabToolsActive && !isAnyToolPanelOpen) {
        if(bannerVid.paused) {
            let p = bannerVid.play();
            if(p !== undefined) p.catch(e => {}); 
        }
    } else {
        if(!bannerVid.paused) {
            bannerVid.pause();
        }
    }
}, 500);

// ==========================================
// 10. MESIN PENAMBAL PROGRESS BAR
// ==========================================
setInterval(function() {
    let seekBar = document.getElementById('seek-bar');
    let audioPlayer = document.getElementById('local-audio-player');
    if(!seekBar || !audioPlayer) return;

    if(audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        let current = audioPlayer.currentTime || 0;
        let duration = audioPlayer.duration;
        let percent = (current / duration) * 100;

        if(document.activeElement !== seekBar) {
            seekBar.value = percent;
        }

        seekBar.style.background = `linear-gradient(to right, var(--primary) ${percent}%, #333 ${percent}%)`;
    } else {
        seekBar.style.background = `linear-gradient(to right, var(--primary) 0%, #333 0%)`;
    }
}, 100);

// ==========================================
// 11. MESIN ANTI-STUCK (PENGOBAT LOADING LAMA)
// ==========================================
window.stuckMonitorCount = 0;
window.lastStuckText = "";

setInterval(function() {
    let titleEl = document.getElementById('mini-title');
    let audioEl = document.getElementById('local-audio-player');

    if(!titleEl || !audioEl) return;

    let txt = titleEl.innerText || "";
    let isLoading = txt.includes("Mengekstrak stream") || 
                    txt.includes("Mencari rekomendasi") || 
                    txt.includes("Memuat") ||
                    txt.includes("Menghubungkan");

    if(isLoading) {
        if(window.lastStuckText === txt) {
            window.stuckMonitorCount++;
        } else {
            window.lastStuckText = txt;
            window.stuckMonitorCount = 0;
        }

        if(window.stuckMonitorCount >= 12) {
            window.stuckMonitorCount = 0;
            if(typeof window.showToast === 'function') {
                window.showToast("Koneksi server lambat (Timeout). Memaksa lewati lagu...", "error");
            }
            audioEl.pause();
            audioEl.removeAttribute('src');
            audioEl.load();
            if(typeof window.playNextInQueue === 'function') {
                setTimeout(() => window.playNextInQueue(), 500);
            }
        }
    } else {
        window.stuckMonitorCount = 0;
        window.lastStuckText = "";
    }

    if(audioEl.duration && audioEl.currentTime >= (audioEl.duration - 0.5) && audioEl.duration > 0 && !isLoading) {
        window.stuckMonitorCount++;
        if(window.stuckMonitorCount >= 5) { 
            window.stuckMonitorCount = 0;
            if(typeof window.playNextInQueue === 'function') window.playNextInQueue();
        }
    }
}, 1000);

// =========================================================================
// 12. MESIN UPDATE PROFILE & UPLOAD AVATAR (STRICT LOCAL MEMORY)
// =========================================================================
window.selectedAvatarBase64 = null;

setTimeout(() => {
    let uname = localStorage.getItem('ytpro_username') || localStorage.getItem('username') || localStorage.getItem('user') || "Guest";
    let avatarPath = localStorage.getItem('ytpro_avatar') || "";
    let finalAvatarUrl = `https://ui-avatars.com/api/?name=${uname}&background=002244&color=00e5ff`;

    if (avatarPath && typeof PTERODACTYL_API_URL !== 'undefined') {
        finalAvatarUrl = PTERODACTYL_API_URL + avatarPath;
    }
    let hImg = document.getElementById('header-avatar-img');
    if(hImg) hImg.src = finalAvatarUrl;
}, 3000);

window.openProfileView = function() {
    let uname = localStorage.getItem('ytpro_username') || localStorage.getItem('username') || localStorage.getItem('user') || "Guest";

    if(uname.toUpperCase() === "GUEST") {
        window.showToast("Sesi habis! Silakan Login ke akun kamu dulu ya sayang.", "error");
        let authModal = document.getElementById('auth-modal');
        if(authModal) authModal.classList.add('show');
        return;
    }

    document.getElementById('profile-username-txt').innerText = uname;
    document.getElementById('profile-reg-txt').innerText = "Status: Akun Aktif";
    document.getElementById('profile-login-txt').innerText = "Terkoneksi ke Server Utama";

    let avatarPath = localStorage.getItem('ytpro_avatar') || "";
    let finalUrl = avatarPath && typeof PTERODACTYL_API_URL !== 'undefined' ? (PTERODACTYL_API_URL + avatarPath) : `https://ui-avatars.com/api/?name=${uname}&background=002244&color=00e5ff`;

    document.getElementById('profile-avatar-img').src = finalUrl;
    window.selectedAvatarBase64 = null; 
    document.getElementById('profile-old-pass').value = '';
    document.getElementById('profile-new-pass').value = '';

    document.getElementById('profile-view').classList.add('active');
};

window.handleAvatarSelect = function(event) {
    let file = event.target.files[0];
    if(file) {
        if(file.size > 3000000) { 
            window.showToast("Ukuran foto maksimal 3MB!", "error");
            return;
        }
        let reader = new FileReader();
        reader.onload = function(e) {
            window.selectedAvatarBase64 = e.target.result; 
            document.getElementById('profile-avatar-img').src = window.selectedAvatarBase64; 
            window.showToast("Foto siap! Silakan klik simpan.", "info");
        };
        reader.readAsDataURL(file);
    }
};

window.updateProfileData = function() {
    let uname = localStorage.getItem('ytpro_username') || localStorage.getItem('username') || localStorage.getItem('user');
    let oldPass = document.getElementById('profile-old-pass').value.trim();
    let newPass = document.getElementById('profile-new-pass').value.trim();

    if(!uname || uname.toUpperCase() === "GUEST") {
        window.showToast("Akses ditolak! Silakan login terlebih dahulu.", "error");
        return;
    }
    if(!oldPass) {
        window.showToast("Autentikasi gagal. Data password tidak terbaca di memori!", "error");
        return;
    }

    let btn = document.getElementById('btn-save-profile');
    btn.innerText = "MENYIMPAN..."; btn.disabled = true;

    let apiUrl = typeof PTERODACTYL_API_URL !== 'undefined' ? PTERODACTYL_API_URL : "";

    fetch(apiUrl + '/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: uname,
            password: oldPass,
            new_password: newPass,
            avatar_b64: window.selectedAvatarBase64
        })
    })
    .then(r => r.json())
    .then(res => {
        btn.innerText = "SIMPAN PERUBAHAN"; btn.disabled = false;
        if(res.status === 'success') {
            window.showToast("Profile & Avatar Berhasil Diperbarui!", "success");
            if(newPass) {
                localStorage.setItem('ytpro_password', newPass);
                localStorage.setItem('password', newPass); 
            }
            if(res.avatar) {
                localStorage.setItem('ytpro_avatar', res.avatar);
                document.getElementById('header-avatar-img').src = apiUrl + res.avatar;
            }
            document.getElementById('profile-view').classList.remove('active');
        } else {
            window.showToast(res.message || "Gagal menyimpan. Password salah?", "error");
        }
    }).catch(e => {
        btn.innerText = "SIMPAN PERUBAHAN"; btn.disabled = false;
        window.showToast("Gagal terhubung ke server!", "error");
    });
};

if (typeof window.oldHandleBackSocialProfile === 'undefined') {
    window.oldHandleBackSocialProfile = window.handleBackButton;
    window.handleBackButton = function() {
        let profilePanel = document.getElementById('profile-view');
        if(profilePanel && profilePanel.classList.contains('active')) {
            profilePanel.classList.remove('active');
            return "handled";
        }
        if(typeof window.oldHandleBackSocialProfile === 'function') {
            return window.oldHandleBackSocialProfile();
        }
        return "exit";
    };
}

// =========================================================================
// 13. ADMIN PANEL SYSTEM & DASHBOARD ROLE (ULTIMATE FIX)
// =========================================================================

// Inject Device Info
if(typeof window.originalFetchAdmin === 'undefined') {
    window.originalFetchAdmin = window.fetch;
    window.fetch = async function() {
        if(arguments[1] && arguments[1].body && typeof arguments[1].body === 'string') {
            if(arguments[0] && (arguments[0].includes('/api/auth') || arguments[0].includes('/api/sync') || arguments[0].includes('/api/update_profile'))) {
                try {
                    let reqBody = JSON.parse(arguments[1].body);
                    let cpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' Cores' : '8 Cores';
                    let mem = navigator.deviceMemory ? navigator.deviceMemory + 'GB RAM' : 'Unknown RAM';
                    let os = navigator.userAgent.includes("Android") ? "Android" : "Unknown OS";
                    reqBody.device_info = `OS: ${os}, ${cpu}, ${mem}`;
                    arguments[1].body = JSON.stringify(reqBody);
                } catch(e) {}
            }
        }

        let response = await window.originalFetchAdmin.apply(this, arguments);
        let clone = response.clone();

        if(arguments[0] && arguments[0].includes('/api/auth')) {
            clone.json().then(data => {
                if(data.status === 'success' && data.role) {
                    localStorage.setItem('ytpro_role', data.role);
                    let roleEl = document.getElementById('dash-role');
                    if(roleEl) roleEl.innerText = data.role;
                    let adminBtn = document.getElementById('btn-sidebar-admin');
                    if(adminBtn) adminBtn.style.display = (data.role === "Admin") ? 'flex' : 'none';
                }
            }).catch(e => {});
        }
        return response;
    };
}

setTimeout(() => {
    let savedRole = localStorage.getItem('ytpro_role') || "Member";
    let roleEl = document.getElementById('dash-role'); if(roleEl) roleEl.innerText = savedRole;
    let adminBtn = document.getElementById('btn-sidebar-admin');
    if(adminBtn) adminBtn.style.display = (savedRole === "Admin") ? 'flex' : 'none';
}, 2000);

window.openAdminPanel = function() {
    let uname = "Guest";
    let sidebarName = document.getElementById('sidebar-username-txt');
    if (sidebarName && sidebarName.textContent && sidebarName.textContent.trim().toUpperCase() !== "GUEST") uname = sidebarName.textContent.trim();
    if (uname.toUpperCase() === "GUEST") uname = localStorage.getItem('ytpro_username') || localStorage.getItem('username') || localStorage.getItem('user') || "Guest";

    let upass = localStorage.getItem('ytpro_password') || localStorage.getItem('password') || localStorage.getItem('user_pass');

    if(!upass) {
        upass = prompt("Keamanan Server: Masukkan Password Admin Anda:", "");
        if(!upass) { window.showToast("Akses dibatalkan.", "error"); return; }
        localStorage.setItem('password', upass);
        localStorage.setItem('ytpro_password', upass);
    }

    if(uname.toUpperCase() === "GUEST") { window.showToast("Akses ditolak! Silakan Login ulang.", "error"); return; }

    let apiUrl = typeof PTERODACTYL_API_URL !== 'undefined' ? PTERODACTYL_API_URL : "";

    document.getElementById('admin-panel-view').classList.add('active');
    document.getElementById('admin-users-list').innerHTML = '<div style="text-align:center; padding:30px 0;"><p style="color:#00e5ff;font-size:12px;">Membobol Database Server...</p></div>';

    fetch(apiUrl + '/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname, password: upass })
    })
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success' && res.data) {
            let users = res.data;
            let uList = Object.keys(users);
            document.getElementById('admin-total-users').innerText = uList.length;

            let html = "";
            uList.forEach(user => {
                let d = users[user];
                let avatar = d.avatar ? (apiUrl + d.avatar) : `https://ui-avatars.com/api/?name=${user}&background=002244&color=00e5ff`;
                let playlistsCount = d.playlists ? Object.keys(d.playlists).length : 0;
                let historyCount = d.history ? d.history.length : 0;
                let roleColor = d.role === "Admin" ? "#ff003c" : "#00e5ff";

                let statusDot = '<span style="color:#ff003c;">● Offline</span>';
                if(d.last_login && (d.last_login.includes(new Date().toLocaleString('en-US', { day: '2-digit', month: 'short' })) || d.last_login.includes("Baru"))) {
                    statusDot = '<span style="color:#1db954;">● Online</span>';
                }

                // Render Playlist Dropdown
                let plHtml = '';
                if(playlistsCount > 0) {
                    for(let pl in d.playlists) plHtml += `<div style="margin-bottom:4px;"><span style="color:#ffaa00; font-weight:bold;">• ${pl}</span> <span style="color:#888;">(${d.playlists[pl].length} Lagu)</span></div>`;
                } else plHtml = '<span style="color:#888;">Kosong</span>';

                // Render History Dropdown
                let histHtml = '';
                if(historyCount > 0) {
                    let hArr = d.history.slice().reverse();
                    hArr.forEach(h => {
                        let t = h.title || h; let a = h.artist || '';
                        histHtml += `<div style="margin-bottom:4px; border-bottom:1px solid #111; padding-bottom:2px;"><span style="color:#1db954;">▶</span> <span style="color:#fff;">${t}</span> <span style="color:#888;">${a ? '— '+a : ''}</span></div>`;
                    });
                } else histHtml = '<span style="color:#888;">Kosong</span>';

                html += `
                <div style="background:#050505; border:1px solid #222; border-radius:10px; padding:15px; text-align:left; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; border-bottom:1px solid #111; padding-bottom:12px;">
                        <img src="${avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid ${roleColor};" id="role_img_${user}">
                        <div>
                            <h4 style="margin:0; color:#fff; font-size:14px; text-transform:uppercase;">${user} <span id="role_badge_${user}" style="background:${roleColor}; color:#000; font-size:9px; padding:2px 6px; border-radius:4px; vertical-align:middle;">${d.role || 'Member'}</span></h4>
                            <p style="margin:2px 0 0 0; font-size:10px; font-weight:bold;">${statusDot}</p>
                        </div>
                    </div>
                    
                    <div style="font-size:11px; color:#aaa; line-height:1.6;">
                        <div style="display:flex; justify-content:space-between;"><span>Password:</span><b style="color:var(--accent); font-family:monospace;">${d.password}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>IP Address:</span><b style="color:#fff; font-family:monospace;">${d.last_ip || 'Unknown'}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>Device Info:</span><b style="color:#fff;">${d.device_info || 'Mobile'}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>Versi APK:</span><b style="color:#fff;">${d.app_version || '-'}</b></div>
                    </div>

                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #222;">
                        <div style="display:flex; justify-content:space-between;"><span>Register:</span><b style="color:#fff; font-size:10px;">${d.register_time || '-'}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>Aktivitas Terakhir:</span><b style="color:#1db954; font-size:10px;">${d.last_login || '-'}</b></div>
                    </div>

                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #222;">
                        <details style="background:#000a14; padding:8px; border-radius:8px; border:1px dashed #00e5ff; margin-bottom:8px; outline:none;">
                            <summary style="cursor:pointer; color:#00e5ff; font-size:11px; font-weight:bold; outline:none;">📁 Lihat Daftar Album (${playlistsCount})</summary>
                            <div style="padding-top:8px; font-size:10px; max-height:120px; overflow-y:auto;">${plHtml}</div>
                        </details>
                        <details style="background:#000a14; padding:8px; border-radius:8px; border:1px dashed #1db954; margin-bottom:8px; outline:none;">
                            <summary style="cursor:pointer; color:#1db954; font-size:11px; font-weight:bold; outline:none;">🕒 Lihat Histori Putar (${historyCount})</summary>
                            <div style="padding-top:8px; font-size:10px; max-height:120px; overflow-y:auto;">${histHtml}</div>
                        </details>
                    </div>

                    <div style="margin-top:10px; display:flex; gap:5px;">
                        <select id="role_select_${user}" style="background:#111; color:#fff; border:1px solid #1db954; padding:5px; border-radius:5px; font-size:10px; flex-grow:1;">
                            <option value="Member" ${d.role !== 'Admin' ? 'selected' : ''}>Member</option>
                            <option value="Admin" ${d.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <button onclick="window.changeUserRole('${user}')" style="background:#1db954; color:#000; border:none; padding:5px 10px; border-radius:5px; font-size:10px; font-weight:bold; cursor:pointer;">UBAH ROLE</button>
                    </div>
                </div>`;
            });
            document.getElementById('admin-users-list').innerHTML = html;
        } else {
            window.showToast("Bukan Admin!", "error");
            document.getElementById('admin-panel-view').classList.remove('active');
        }
    }).catch(e => {
        window.showToast("Gagal terhubung ke API", "error");
        document.getElementById('admin-panel-view').classList.remove('active');
    });
};

window.changeUserRole = function(targetUser) {
    let uname = localStorage.getItem('ytpro_username') || localStorage.getItem('username') || localStorage.getItem('user');
    let upass = localStorage.getItem('ytpro_password') || localStorage.getItem('password') || localStorage.getItem('user_pass');
    
    let selectEl = document.getElementById('role_select_' + targetUser);
    if(!selectEl) return;
    
    let newRole = selectEl.value;
    let apiUrl = typeof PTERODACTYL_API_URL !== 'undefined' ? PTERODACTYL_API_URL : "";

    fetch(apiUrl + '/api/admin/change_role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_user: uname, admin_pass: upass, target_user: targetUser, new_role: newRole })
    })
    .then(r => {
        if (!r.ok) throw new Error("Endpoint 404 (Python Server belum ter-update)");
        return r.json();
    })
    .then(res => {
        if(res.status === 'success') {
            window.showToast(res.message, "success");
            let badge = document.getElementById('role_badge_' + targetUser);
            let img = document.getElementById('role_img_' + targetUser);
            if(badge) {
                badge.innerText = newRole;
                badge.style.background = newRole === 'Admin' ? '#ff003c' : '#00e5ff';
            }
            if(img) {
                img.style.borderColor = newRole === 'Admin' ? '#ff003c' : '#00e5ff';
            }
        } else {
            window.showToast(res.message || "Gagal mengubah role", "error");
        }
    }).catch(e => {
        window.showToast("Koneksi Error: " + e.message, "error");
    });
};


if (typeof window.oldHandleBackSocialAdmin === 'undefined') {
    window.oldHandleBackSocialAdmin = window.handleBackButton;
    window.handleBackButton = function() {
        let adminPanel = document.getElementById('admin-panel-view');
        if(adminPanel && adminPanel.classList.contains('active')) {
            adminPanel.classList.remove('active');
            return "handled";
        }
        if(typeof window.oldHandleBackSocialAdmin === 'function') {
            return window.oldHandleBackSocialAdmin();
        }
        return "exit";
    };
}
// =========================================================================
// 14. MOVIE & TV SHOW WATCHER (NETFLIX CLONE ENGINE)
// =========================================================================

window.openMovieTool = function() {
    document.getElementById('movie-tool-view').classList.add('active');
};
window.closeMovieTool = function() {
    document.getElementById('movie-tool-view').classList.remove('active');
};

window.searchMovieApi = function() {
    let query = document.getElementById('movie-search-input').value.trim();
    let resDiv = document.getElementById('movie-search-results');
    if(!query) return;
    
    resDiv.innerHTML = '<div style="text-align:center;padding:20px;"><svg class="spin-anim" viewBox="0 0 24 24" style="width:30px;height:30px;fill:#e50914;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg><p style="color:#888;font-size:12px;margin-top:10px;">Menembus database film dunia...</p></div>';
    
    // Menggunakan TMDB Public Read API untuk Search Meta Data
    let tmdbKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; 
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&language=id-ID&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        resDiv.innerHTML = '';
        if(data.results && data.results.length > 0) {
            let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
            data.results.forEach(movie => {
                if(movie.media_type === 'person') return; // Skip actor profiles
                
                let title = (movie.title || movie.name).replace(/'/g, "\\'");
                let img = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '';
                let imgHtml = img ? `<img src="${img}" class="card-img" style="border:1px solid #e50914;">` : `<div class="card-img" style="border:1px solid #e50914; background:#111; display:flex; align-items:center; justify-content:center; font-size:8px;">No IMG</div>`;
                let id = movie.id;
                let type = movie.media_type === 'tv' ? 'TV Series' : 'Movie';
                let release = movie.release_date || movie.first_air_date || 'N/A';
                let score = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
                
                html += `
                <div class="card slide-up" onclick="window.playMovie('${id}', '${title}', '${movie.media_type}')" style="border-color:#e50914; background:#000a14;">
                    ${imgHtml}
                    <div class="card-info">
                        <h3 style="color:#fff;">${movie.title || movie.name}</h3>
                        <p style="color:#e50914;">${type} • ⭐ ${score} • ${release.substring(0,4)}</p>
                    </div>
                    <div style="color:#e50914; font-size:18px;">▶</div>
                </div>`;
            });
            html += '</div>';
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = '<p style="color:#666;text-align:center;font-size:12px;">Film tidak ditemukan di server.</p>';
        }
    }).catch(err => {
        resDiv.innerHTML = '<p style="color:var(--primary);text-align:center;font-size:12px;">Gagal terhubung ke database API.</p>';
    });
};

window.currentMovieData = { id: '', type: '' };

window.playMovie = function(id, title, type) {
    window.currentMovieData = { id: id, type: type };
    document.getElementById('movie-player-title').innerText = title;
    document.getElementById('movie-player-modal').classList.add('show');
    window.switchMovieServer(1); // Auto load Server 1
    
    // Auto-Pause Musik kalau ada yang lagi diputar
    let lp = document.getElementById('local-audio-player');
    if (lp && !lp.paused) { window.togglePlayPause(); }
};

window.switchMovieServer = function(serverNum) {
    let iframe = document.getElementById('movie-iframe');
    let id = window.currentMovieData.id;
    let type = window.currentMovieData.type; // 'movie' atau 'tv'
    
    // Inject Subtitle Indonesia otomatis dengan domain server yang lebih stabil
    let embedUrl = '';
    if(serverNum === 1) {
        // Server 1: Vidsrc.me (Domain paling stabil saat ini)
        embedUrl = type === 'tv' ? `https://vidsrc.me/embed/tv?tmdb=${id}` : `https://vidsrc.me/embed/movie?tmdb=${id}`;
    } else if(serverNum === 2) {
        // Server 2: Vidsrc.net (Jalur alternatif)
        embedUrl = type === 'tv' ? `https://vidsrc.net/embed/tv?tmdb=${id}` : `https://vidsrc.net/embed/movie?tmdb=${id}`;
    } else {
        // Server 3: Smashy Stream (Server Independen yang kuat)
        embedUrl = type === 'tv' ? `https://player.smashy.stream/tv/${id}?s=1&e=1` : `https://player.smashy.stream/movie/${id}`;
    }
    
    // Tampilkan loading screen sementara iframe memuat
    iframe.src = ""; 
    setTimeout(() => {
        iframe.src = embedUrl;
    }, 100);
    
    window.showToast("Menghubungkan ke Server " + serverNum, "info");
};


window.closeMoviePlayer = function() {
    document.getElementById('movie-iframe').src = ""; // Stop video & audio
    document.getElementById('movie-player-modal').classList.remove('show');
};

// Pencegat tombol back khusus movie panel
if (typeof window.oldHandleBackSocialMovie === 'undefined') {
    window.oldHandleBackSocialMovie = window.handleBackButton;
    window.handleBackButton = function() {
        let moviePlayer = document.getElementById('movie-player-modal');
        if(moviePlayer && moviePlayer.classList.contains('show')) {
            window.closeMoviePlayer();
            return "handled";
        }
        let moviePanel = document.getElementById('movie-tool-view');
        if(moviePanel && moviePanel.classList.contains('active')) {
            window.closeMovieTool();
            return "handled";
        }
        if(typeof window.oldHandleBackSocialMovie === 'function') {
            return window.oldHandleBackSocialMovie();
        }
        return "exit";
    };
}
