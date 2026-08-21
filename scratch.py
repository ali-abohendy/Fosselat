import json

with open('frontend/public/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('output.txt', 'w', encoding='utf-8') as out:
    for t in data['tracks']:
        for p in t['programs']:
            for bank in p.get('levelBanks', []):
                for q in bank.get('questions', []):
                    prompt = q.get('prompt', '')
                    arabic = q.get('arabic', '')
                    s = json.dumps(q, ensure_ascii=False)
                    
                    if 'Which letter' in prompt or 'Which letter' in arabic or 'adds at the end' in prompt:
                        out.write(f"ID: {q['id']} - PROMPT: {prompt} - ARABIC: {arabic} - OPTIONS: {q.get('options')}\n")
                    elif 'How is this word read' in prompt or 'How is this read' in prompt:
                        if 'A-M-A-L' in str(q.get('options', '')):
                            out.write(f"ID: {q['id']} - PROMPT: {prompt} - ARABIC: {arabic} - OPTIONS: {q.get('options')} - CORRECT: {q.get('correctAnswer')}\n")
                    elif 'sign لا' in prompt or 'sign ميم' in prompt:
                        out.write(f"ID: {q['id']} - PROMPT: {prompt}\n")
                    elif 'Madd Munfasil' in prompt and 'Hafs' in prompt:
                        out.write(f"ID: {q['id']} - PROMPT: {prompt} - OPTIONS: {q.get('options')}\n")
                    elif 'deepest part of the throat' in prompt:
                        out.write(f"ID: {q['id']} - PROMPT: {prompt} - OPTIONS: {q.get('options')}\n")
                    elif 'آمنوا وعملوا' in arabic or 'على الأرائك' in arabic or 'ضل سعيهم' in arabic or 'إلا خسارة' in arabic or 'وهي رميم' in arabic:
                        out.write(f"ID: {q['id']} - ARABIC: {arabic}\n")
                    elif 'بسيماهم' in arabic or 'أحسن الله' in arabic or 'ويعمل صالحا' in arabic or 'عنه سيئاته' in arabic:
                        out.write(f"ID: {q['id']} - ARABIC: {arabic}\n")
                    elif 'من ماء' in arabic and 'يسقى' in arabic:
                        out.write(f"ID: {q['id']} - ARABIC: {arabic}\n")
                    elif 'ما يتقون' in arabic:
                        out.write(f"ID: {q['id']} - ARABIC: {arabic}\n")
                    elif 'سْ' in arabic:
                        out.write(f"ID: {q['id']} - PROMPT: {prompt} - ARABIC: {arabic}\n")
