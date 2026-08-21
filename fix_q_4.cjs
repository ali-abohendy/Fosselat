const fs = require('fs');

let data = JSON.parse(fs.readFileSync('frontend/public/questions.json', 'utf8'));

for (let track of data.tracks) {
  if (track.id === 'quran') {
    for (let prog of track.programs) {
      if (prog.id === 'memorization') {
        let bank = prog.levelBanks.find(b => b.level === 1);
        if (bank && bank.questions) {
          let q = bank.questions.find(x => x.id === 'MEM_L1_032');
          if (q) q.arabic = "إِلَّا الَّذِينَ ءَامَنُواْ وَعَمِلُواْ الصَّـٰلِحَٰتِ وَتَوَاصَوْاْ  ______  وَتَوَاصَوْاْ بِالصَّبْرِ";
          let q2 = bank.questions.find(x => x.id === 'MEM_L1_033');
          if (q2) q2.arabic = "رَسُولٞ مِّنَ اللَّهِ يَتْلُواْ  ______  مُّطَهَّرَةٗ فِيهَا كُتُبٞ قَيِّمَةٞ";
        }
      }
    }
  }
  
  if (track.id === 'arabic') {
    for (let prog of track.programs) {
      if (prog.id === 'foundation') {
        let bank1 = prog.levelBanks.find(b => b.level === 1);
        if (bank1 && bank1.questions) {
          for (let q of bank1.questions) {
            if (q.prompt && q.prompt.includes('adds at the end of')) {
              const mapping = {
                'ب': 'Baa', 'ت': 'Taa', 'ث': 'Thaa', 'ن': 'Noon', 'م': 'Meem',
                'س': 'Seen', 'ش': 'Sheen', 'ل': 'Laam', 'ك': 'Kaaf', 'ي': 'Yaa',
                'أ': 'Alif / Hamzah', 'ع': 'Ayn', 'ح': 'Haa', 'خ': 'Khaa', 'ج': 'Jeem',
                'ر': 'Raa', 'ز': 'Zaay', 'د': 'Daal', 'ذ': 'Thaal', 'ص': 'Saad',
                'ض': 'Daad', 'ط': 'Taa', 'ظ': 'Thaa', 'ف': 'Fa', 'ق': 'Qaaf',
                'ه': 'Haa', 'و': 'Waw', 'غ': 'Ghayn'
              };
              if (q.options) {
                q.options = q.options.map(opt => mapping[opt.trim()] || opt);
                if (q.correctAnswer) {
                  q.correctAnswer = mapping[q.correctAnswer.trim()] || q.correctAnswer;
                }
              }
              q.optionsArabic = false;
            }
          }
        }
        
        let bank2 = prog.levelBanks.find(b => b.level === 2);
        if (bank2 && bank2.questions) {
          for (let q of bank2.questions) {
            if (q.prompt && q.prompt.includes('How is this read?')) {
              if (q.arabic && q.arabic.endsWith('ْ') && q.arabic.length <= 2) {
                q.arabic = 'أَ' + q.arabic;
                if (q.options) {
                  q.options = q.options.map(opt => {
                    if (opt === 's') return 'as';
                    if (opt === 'm') return 'am';
                    if (opt === 'b') return 'ab';
                    if (opt === 't') return 'at';
                    if (opt === 'sh') return 'ash';
                    if (opt === 'k') return 'ak';
                    if (opt === 'l') return 'al';
                    if (opt === 'n') return 'an';
                    if (opt.length <= 2) return 'a' + opt;
                    return opt;
                  });
                }
                if (q.correctAnswer) {
                  let ans = q.correctAnswer;
                  if (ans === 's') q.correctAnswer = 'as';
                  else if (ans === 'm') q.correctAnswer = 'am';
                  else if (ans === 'b') q.correctAnswer = 'ab';
                  else if (ans === 't') q.correctAnswer = 'at';
                  else if (ans === 'sh') q.correctAnswer = 'ash';
                  else if (ans === 'k') q.correctAnswer = 'ak';
                  else if (ans === 'l') q.correctAnswer = 'al';
                  else if (ans === 'n') q.correctAnswer = 'an';
                  else if (ans.length <= 2) q.correctAnswer = 'a' + ans;
                }
              }
            }
          }
        }
      }
    }
  }
}

fs.writeFileSync('frontend/public/questions.json', JSON.stringify(data, null, 1));
console.log('Fixed everything');
