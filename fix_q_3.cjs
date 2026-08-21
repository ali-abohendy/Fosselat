const fs = require('fs');

let data = JSON.parse(fs.readFileSync('frontend/public/questions.json', 'utf8'));

// Fix Memorization Level 1 & 2
for (let track of data.tracks) {
  if (track.id === 'quran') {
    for (let prog of track.programs) {
      if (prog.id === 'memorization') {
        // Find MEM_L1_032
        if (prog.levelBanks['0'] && prog.levelBanks['0'].questions) {
          let q = prog.levelBanks['0'].questions.find(x => x.id === 'MEM_L1_032');
          if (q) {
            q.arabic = "إِلَّا الَّذِينَ ءَامَنُواْ وَعَمِلُواْ الصَّـٰلِحَٰتِ وَتَوَاصَوْاْ  ______  وَتَوَاصَوْاْ بِالصَّبْرِ";
          }
          let q2 = prog.levelBanks['0'].questions.find(x => x.id === 'MEM_L1_033');
          if (q2) {
             q2.arabic = "رَسُولٞ مِّنَ اللَّهِ يَتْلُواْ  ______  مُّطَهَّرَةٗ فِيهَا كُتُبٞ قَيِّمَةٞ";
          }
        }
      }
    }
  }
}

fs.writeFileSync('frontend/public/questions.json', JSON.stringify(data, null, 1));
console.log('Fixed questions');
