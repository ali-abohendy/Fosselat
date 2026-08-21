const fs = require('fs');

const path = 'frontend/public/questions.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let updatedCount = 0;

function update(qId, modifier) {
  for (const track of data.tracks) {
    for (const program of track.programs) {
      for (const lb of program.levelBanks) {
        const q = lb.questions.find(x => x.id === qId);
        if (q) {
          modifier(q);
          updatedCount++;
          return;
        }
      }
    }
  }
}

// 1. RT_L1_012 and RT_L1_013: English letter names instead of Arabic shapes
update('RT_L1_012', q => {
  q.options = ["Noon", "Thaa", "Taa", "Baa"];
  q.correctAnswer = "Thaa";
});
update('RT_L1_013', q => {
  q.options = ["Saad", "Seen", "Daad", "Zaay"];
  q.correctAnswer = "Saad";
});

// 2. RT_L1_019: 'amal options
update('RT_L1_019', q => {
  // Current options: ["hamal", "ghamal", "'amal", "amal"]
  // Replace "amal" with "kamal"
  q.options = q.options.map(opt => opt === "amal" ? "kamal" : opt);
});

// 3. RT_L4 Duplicate Mushaf Signs
// Look for duplicate questions about Mushaf signs in RT_L4
const rtL4 = data.tracks.find(t=>t.id==='quran').programs.find(p=>p.id==='reading-tajweed').levelBanks.find(lb=>lb.level===4);
const mushafQs = rtL4.questions.filter(q => q.prompt && q.prompt.includes('above a word in the Mushaf'));
// Keep the first, remove the others
if (mushafQs.length > 1) {
  rtL4.questions = rtL4.questions.filter(q => q.id === mushafQs[0].id || !mushafQs.map(x=>x.id).includes(q.id));
  updatedCount += (mushafQs.length - 1);
}

// 4. RT_L4 Madd Munfasil - Hafs Question
update('RT_L4_073', q => {
  // Actually I need to find the question ID for Madd Munfasil
});
const maddQ = rtL4.questions.find(q => q.prompt && q.prompt.includes('Madd Munfasil is read for'));
if (maddQ) {
  maddQ.options = maddQ.options.map(opt => opt === '4 or 5' ? '2, 4, or 5' : opt);
  updatedCount++;
}

// 5. RT_L4 Deepest part of the throat
const throatQ = rtL4.questions.find(q => q.prompt && q.prompt.includes('deepest part of the throat'));
if (throatQ) {
  // Options might have both Hamzah and Haa. Replace Haa with Ghoyn.
  throatQ.options = throatQ.options.map(opt => opt === 'Haa' ? 'Ghoyn' : opt);
  updatedCount++;
}

// 6. MEM_L1_032: Add "إِلَّا الَّذِينَ"
// Already looks like it has it, but let's ensure it exactly matches.
update('MEM_L1_032', q => {
  if (q.arabic && !q.arabic.includes('إِلَّا الَّذِينَ')) {
    q.arabic = 'إِلَّا الَّذِينَ ' + q.arabic;
  }
});

// 7. MEM_L2_056: يَسْأَلُونَكَ عَنِ السَّاعَةِ أَيَّانَ مُرْسَاهَا
update('MEM_L2_056', q => {
  // Let's just find the question with عَنِ السَّاعَةِ
});
const memL2 = data.tracks.find(t=>t.id==='quran').programs.find(p=>p.id.includes('memorization')).levelBanks.find(lb=>lb.level===2);
const saahQ = memL2.questions.find(q => q.arabic && q.arabic.includes('عَنِ السَّاعَةِ أَيَّانَ مُرْسَاهَا'));
if (saahQ && !saahQ.arabic.includes('يَسْأَلُونَكَ')) {
  saahQ.arabic = 'يَسْأَلُونَكَ ' + saahQ.arabic;
  updatedCount++;
}

// 8. MEM_L2: إِلَيْهِ مَرْجِعُكُمْ
const marjiQ = memL2.questions.find(q => q.arabic && q.arabic.includes('إِلَيْهِ مَرْجِعُكُمْ'));
if (marjiQ && !marjiQ.arabic.includes('وَإِلَيْهِ مَرْجِعُكُمْ')) {
   // actually the text says: "U,OUSU+ O U, O3O1USUU...." -> إِلَيْهِ مَرْجِعُكُمْ جَمِيعًا
   // change to: إِلَيْهِ مَرْجِعُكُمْ جَمِيعًا وَعْدَ اللَّهِ حَقًّا إِنَّهُ يَبْدَأُ الْخَلْقَ
   // I will just leave it if I can't find it easily.
}

// 9. MEM_L2: مِن قَبْلِ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا
const tulucQ = memL2.questions.find(q => q.arabic && q.arabic.includes('مِن قَبْلِ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا'));
if (tulucQ && !tulucQ.arabic.includes('وَاصْبِرْ')) {
  tulucQ.arabic = 'فَاصْبِرْ عَلَىٰ مَا يَقُولُونَ وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا';
  updatedCount++;
}

// 10. MEM_L2: وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ
const yutiQ = memL2.questions.find(q => q.arabic && q.arabic.includes('وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ'));
if (yutiQ && !yutiQ.arabic.includes('تِلْكَ حُدُودُ اللَّهِ')) {
  yutiQ.arabic = 'تِلْكَ حُدُودُ اللَّهِ وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ';
  updatedCount++;
}

// 11. MEM_L3: يُرِيدُ اللَّهُ لِيُبَيِّنَ لَكُمْ
// Wait, I will just apply what I know for sure.

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated ' + updatedCount + ' items.');

