const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export function getChoseong(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) {
      result += CHOSEONG[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

export function matchSearch(item: string, query: string): boolean {
  if (!query) return true;
  
  const rawQuery = query.replace(/\s/g, '');
  const rawItem = item.replace(/\s/g, '');
  
  // 초성만 입력되었는지 확인 (모든 문자가 자음인지)
  const isChoseongQuery = /^[ㄱ-ㅎ]+$/.test(rawQuery);
  
  if (isChoseongQuery) {
    return getChoseong(rawItem).includes(rawQuery);
  }
  
  // 일반 검색
  return rawItem.toLowerCase().includes(rawQuery.toLowerCase());
}

export const POPULAR_COUNTRIES = [
  '대한민국', '일본', '중국', '대만', '홍콩', '마카오', '태국', '베트남', '필리핀', '인도네시아', '말레이시아', '싱가포르', 
  '괌', '사이판', '오스트레일리아', '뉴질랜드', '미국', '캐나다', '멕시코', '영국', '프랑스', '이탈리아', '독일', '스페인', 
  '스위스', '오스트리아', '네덜란드', '벨기에', '그리스', '크로아티아', '러시아', '이집트', '터키 (튀르키예)', '몰디브', '사우디아라비아', 
  '아랍에미리트', '아르헨티나', '브라질', '칠레', '페루', '남아프리카 공화국', '모로코', '스웨덴', '노르웨이', '덴마크', '핀란드'
].sort();
