// =========================================================================
// 1. TIKTOK DOWNLOADER (NO WATERMARK)
// =========================================================================
window.currentTikTokData = null;

window.openTikTokTool = function() {
    document.getElementById('tiktok-tool-view').classList.add('active');
};
window.closeTikTokTool = function() {
    document.getElementById('tiktok-tool-view').classList.remove('active');
    let vid = document.getElementById('tiktok-video-preview'); if(vid) { vid.pause(); vid.src = ""; }
    let aud = document.getElementById('tiktok-audio-preview'); if(aud) { aud.pause(); aud.src = ""; }
};
window.processTikTokAJAX = function() {
    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline untuk menggunakan Tools!", "error"); return; }
    let url = document.getElementById('tiktok-url-input-tool').value.trim();
    if(!url) { window.showToast("URL TikTok tidak boleh kosong!", "error"); return; }
    
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
    let vid = document.getElementById('ig-video-preview'); if(vid) { vid.pause(); vid.src = ""; }
    let aud = document.getElementById('ig-audio-preview'); if(aud) { aud.pause(); aud.src = ""; }
};
window.processIgAJAX = function() {
    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline untuk menggunakan Tools!", "error"); return; }
    let url = document.getElementById('ig-url-input-tool').value.trim();
    if(!url) { window.showToast("URL Instagram tidak boleh kosong!", "error"); return; }
    
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
    ['home','search','history'].forEach(x=>{ document.getElementById('anime-tab-'+x).style.display='none'; document.getElementById('nav-anime-'+x).classList.remove('active'); document.getElementById('nav-anime-'+x).style.color='#555'; });
    document.getElementById('anime-tab-'+t).style.display='block';
    let activeNav=document.getElementById('nav-anime-'+t); activeNav.classList.add('active'); activeNav.style.color='#ff9900';
    if(t==='history') window.renderAnimeHistory();
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
    rDiv.innerHTML=`<div style="text-align:center;padding:30px 0;"><p style="color:#888;font-size:12px;">Mencari "${q}"...</p></div>`;
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

// // // // // =========================================================================
// 5. INTERNET UPPING (SPEED TEST UPLOAD) - VIA PYTHON BACKEND (NATIVE SPEED)
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
    
    // API IP & ISP (Menggunakan GeoJS yang 100% bebas blokir CORS)
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
    if(window.isNetTesting) window.startUploadTest(); // Matikan otomatis jika keluar panel
    document.getElementById('network-tool-view').classList.remove('active');
};

// Fungsi Menggambar Grafik Real-time
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
    
    // --- LOGIKA UNTUK STOP ---
    if (window.isNetTesting) {
        window.isNetTesting = false;
        clearTimeout(window.netTestTimeout);
        btn.innerText = 'MULAI TEST UPLOAD';
        btn.style.background = '#00ff00';
        btn.style.color = '#000';
        btn.style.boxShadow = '0 0 15px rgba(0,255,0,0.4)';
        circle.style.display = 'none';
        
        // Perintahkan Python untuk STOP
        fetch('/stop_upping', { method: 'POST' }).catch(e=>console.log(e));
        
        window.showToast("Proses dihentikan.", "info");
        return;
    }
    
    if(window.isOfflineMode) { window.showToast("Matikan Mode Offline!", "error"); return; }
    
    // --- LOGIKA UNTUK START ---
    window.isNetTesting = true;
    btn.innerText = 'STOP PROSES UPLOAD';
    btn.style.background = '#ff003c';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 0 15px rgba(255,0,60,0.4)';
    circle.style.display = 'block';
    canvas.style.display = 'block';
    window.graphData = [];
    window.drawGraph();
    
    // Auto Stop 2 Menit
    window.netTestTimeout = setTimeout(() => {
        if(window.isNetTesting) {
            window.startUploadTest();
            window.showToast("Batas waktu uji (2 Menit) selesai.", "success");
        }
    }, 120000);
    
    window.showToast("Menjalankan mesin native Python (UDP)...", "info");
    
    // Perintahkan Python untuk START
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

    // Loop bertanya ke Python: "Kecepatan sekarang berapa?" setiap 1 detik
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
                if(window.graphData.length > 20) window.graphData.shift(); // Max 20 history
                window.drawGraph();
            } catch(e) {
                // Abaikan jika lag
            }
        }
    };
    
    monitorSpeed();
};
// ==========================================
// MESIN IMAGE UPSCALER (WEB API SERVER) + BEFORE/AFTER
// ==========================================
window.openUpscaleTool = function() {
    document.getElementById('upscale-tool-view').classList.add('active');
    window.setupSlider(); // Inisiasi interaksi slider panah
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
    
    // Tampilkan foto asli yang belum diproses di sisi KIRI (Before)
    document.getElementById('img-before').src = URL.createObjectURL(file);
    
    try {
        window.showToast("Memproses di Server Web... HP Anda tetap dingin!", "info");
        
        // ---------------------------------------------------------
        // MESIN FETCH API (PENGIRIMAN DATA KE WEB SERVER)
        // ---------------------------------------------------------
        let formData = new FormData();
        formData.append('image', file); // Mengemas file foto untuk diunggah
        // formData.append('scale', document.getElementById('upscale-factor').value); 
        
        /* 
           KODE HTTP REQUEST KE API WEB PIHAK KETIGA
           (Ganti URL di bawah dengan alamat API Web/Server Anda)
           Saat ini saya jadikan komentar agar APK tidak error menolak koneksi.
        */
        // let response = await fetch('https://api.web-upscaler-anda.com/v1/process', {
        //     method: 'POST',
        //     body: formData,
        //     headers: { 'Authorization': 'Bearer API_KEY_ANDA' }
        // });
        // let data = await response.json();
        // let imageUrlDariWeb = data.output_image_url; 

        // --- SIMULASI PENERIMAAN HASIL (Hapus baris ini jika Web API asli sudah dipasang) ---
        let imageUrlDariWeb = URL.createObjectURL(file); 
        // ----------------------------------------------------------------------------------
        
        // TAMPILKAN HASIL DARI WEB KE DALAM APK (Slider)
        let resultImg = document.getElementById('img-after');
        resultImg.onload = function() {
            document.getElementById('upscale-setup-container').style.display = 'none';
            document.getElementById('upscale-result-container').style.display = 'block';
            
            // Kembalikan posisi slider pembatas ke tengah persis
            document.getElementById('img-before').style.clipPath = `polygon(0 0, 50% 0, 50% 100%, 0 100%)`;
            document.getElementById('slider-handle').style.left = `50%`;
            
            // Logika Tombol Download (Mendownload gambar dari URL hasil Web)
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
        
        // Pasang link gambar hasil kiriman Web ke kotak KANAN (After)
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
    if(container.dataset.sliderInit) return; // Mencegah event sentuhan bertumpuk/dobel
    container.dataset.sliderInit = "true";
    
    let beforeImg = document.getElementById('img-before');
    let handle = document.getElementById('slider-handle');
    let isSliding = false;
    
    let slide = function(e) {
        if(!isSliding) return;
        let rect = container.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = clientX - rect.left;
        let pct = Math.max(0, Math.min(100, (x / rect.width) * 100)); // Batasi 0% - 100%
        
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

// Override Back button khusus untuk menutup panel Upscaler
if (typeof window.oldHandleBackUpscale === 'undefined') {
    window.oldHandleBackUpscale = window.handleBackButton;
    window.handleBackButton = function() {
        let upPanel = document.getElementById('upscale-tool-view');
        if(upPanel && upPanel.classList.contains('active')) {
            window.closeUpscaleTool();
            return "handled";
        }
        if(typeof window.oldHandleBackUpscale === 'function') {
            return window.oldHandleBackUpscale();
        }
        return "exit";
    };
}
// ==========================================
// MESIN ANIME WATCHER (TABS, SEARCH, HISTORY)
// ==========================================
window.openAnimeTool = function() {
    document.getElementById('anime-tool-view').classList.add('active');
    // Buka tab beranda secara default saat diklik
    if(typeof window.switchAnimeTab === 'function') {
        window.switchAnimeTab('home'); 
    }
};

window.closeAnimeTool = function() {
    document.getElementById('anime-tool-view').classList.remove('active');
};

window.switchAnimeTab = function(tabName) {
    // Sembunyikan semua konten tab
    document.getElementById('anime-tab-home').style.display = 'none';
    document.getElementById('anime-tab-search').style.display = 'none';
    document.getElementById('anime-tab-history').style.display = 'none';
    
    // Matikan warna aktif tombol tab bawah
    document.getElementById('tab-btn-anime-home').style.color = '#888';
    document.getElementById('tab-btn-anime-search').style.color = '#888';
    document.getElementById('tab-btn-anime-history').style.color = '#888';
    
    // Nyalakan tab yang dipilih
    document.getElementById('anime-tab-' + tabName).style.display = 'block';
    document.getElementById('tab-btn-anime-' + tabName).style.color = '#ff9900';

    if(tabName === 'history') {
        window.renderAnimeHistory();
    }
};

window.searchAnimeApi = function() {
    let query = document.getElementById('anime-search-input').value.trim();
    let resDiv = document.getElementById('anime-search-results');
    if(!query) return;
    
    resDiv.innerHTML = '<div style="text-align:center;padding:20px;"><svg class="spin-anim" viewBox="0 0 24 24" style="width:30px;height:30px;fill:#ff9900;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg><p style="color:#888;font-size:12px;">Mencari anime...</p></div>';
    
    fetch('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(query) + '&sfw=true')
    .then(res => res.json())
    .then(data => {
        resDiv.innerHTML = '';
        if(data.data && data.data.length > 0) {
            let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
            data.data.forEach(anime => {
                let title = anime.title.replace(/'/g, "\\'");
                let img = anime.images.jpg.image_url;
                let id = anime.mal_id;
                let type = anime.type || 'TV';
                let score = anime.score || 'N/A';
                html += `
                <div class="card slide-up" onclick="if(typeof window.fetchAnimeDetail === 'function') { window.fetchAnimeDetail('${id}', '${title}'); } else { window.showToast('Sedang memuat sistem player...', 'info'); }" style="border-color:#ff9900; background:#000a14;">
                    <img src="${img}" class="card-img" style="border:1px solid #ff9900;">
                    <div class="card-info">
                        <h3 style="color:#fff;">${anime.title}</h3>
                        <p style="color:#ff9900;">${type} • Score: ${score}</p>
                    </div>
                    <div style="color:#ff9900; font-size:18px;">❯</div>
                </div>`;
            });
            html += '</div>';
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = '<p style="color:#666;text-align:center;font-size:12px;">Anime tidak ditemukan.</p>';
        }
    }).catch(err => {
        resDiv.innerHTML = '<p style="color:var(--primary);text-align:center;font-size:12px;">Gagal memuat pencarian. Coba lagi.</p>';
    });
};

window.renderAnimeHistory = function() {
    let histDiv = document.getElementById('anime-history-results');
    let history = JSON.parse(localStorage.getItem('ytpro_anime_history')) || [];
    
    if(history.length === 0) {
        histDiv.innerHTML = '<p style="color:#666;text-align:center;font-size:12px;margin-top:20px;">Belum ada riwayat tontonan Anime.</p>';
        return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
    history.reverse().forEach((anime, idx) => {
        let titleStr = anime.title.replace(/'/g, "\\'");
        html += `
        <div class="card slide-up delay-${idx%3+1}" onclick="if(typeof window.fetchAnimeDetail === 'function') { window.fetchAnimeDetail('${anime.id}', '${titleStr}'); }" style="border-color:#ff9900; background:#000a14;">
            <img src="${anime.img}" class="card-img" style="border:1px solid #ff9900;">
            <div class="card-info">
                <h3 style="color:#fff;">${anime.title}</h3>
                <p style="color:#aaa;">Terakhir dilihat</p>
            </div>
            <button class="remove-btn" onclick="event.stopPropagation(); window.removeAnimeHistory('${anime.id}')" style="color:var(--primary); padding:10px; font-size:16px;">✕</button>
        </div>`;
    });
    html += '</div>';
    html += '<button class="btn-no" style="width:100%; border-color:var(--primary); color:var(--primary); padding:12px; margin-top:20px; border-radius:12px; font-size:13px; font-weight:bold;" onclick="window.clearAnimeHistory()">HAPUS SEMUA RIWAYAT</button>';
    histDiv.innerHTML = html;
};

window.removeAnimeHistory = function(id) {
    let history = JSON.parse(localStorage.getItem('ytpro_anime_history')) || [];
    history = history.filter(h => h.id !== id);
    localStorage.setItem('ytpro_anime_history', JSON.stringify(history));
    window.renderAnimeHistory();
};

window.clearAnimeHistory = function() {
    if(typeof window.showConfirm === 'function') {
        window.showConfirm("Hapus semua riwayat anime?", function(){
            localStorage.removeItem('ytpro_anime_history');
            window.renderAnimeHistory();
            window.showToast("Riwayat Anime dibersihkan", "success");
        });
    } else {
        localStorage.removeItem('ytpro_anime_history');
        window.renderAnimeHistory();
    }
};

// Pencegat tombol back HP untuk panel Anime
if (typeof window.oldHandleBackAnime === 'undefined') {
    window.oldHandleBackAnime = window.handleBackButton;
    window.handleBackButton = function() {
        let animePanel = document.getElementById('anime-tool-view');
        if(animePanel && animePanel.classList.contains('active')) {
            window.closeAnimeTool();
            return "handled";
        }
        if(typeof window.oldHandleBackAnime === 'function') {
            return window.oldHandleBackAnime();
        }
        return "exit";
    };
}