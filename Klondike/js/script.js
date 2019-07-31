
//設置牌堆
let leftDeck = [[], [], [], []];  //暫放區
let rightDeck = [[], [], [], []];  //結果區
let underDeck = [[], [], [], [], [], [], [], []]; //牌堆區
let movement = []; //移動紀錄

//複製牌堆，更新時使用
let copyLeftDeck = [[], [], [], []];
let copyRightDeck = [[], [], [], []];
let copyUnderDeck = [[], [], [], [], [], [], [], []];

//工具列
let timer; //放計時ID
let time = 0;
let clock = document.querySelector('#time-text');
// 顯示時間
function showTime(){
    let min = "0" + Math.floor(time/60);
    let sec = "0" + time%60;
    let realTime = min.slice(-2)+':'+sec.slice(-2);
    return realTime;
}
// 增加時間
function countTime(){
    time++;
    clock.innerHTML = showTime();
}
// 每隔一秒增加一次
function counting(){
    timer = setInterval(function(){countTime();},1000);
}

counting();

// 洗牌
function shuffle(arr) {
    for(let i = arr.length - 1 ; i > 0 ; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 建立牌堆
function newCards() {
    let newCardDeck = Array.from({length: 52},(_,k) => k+1);
    let shuffleCardDeck = shuffle(newCardDeck); //把1~52順序的數字洗亂
    // 分 7,7,7,7,6,6,6,6張放入八個牌堆內 0~5 6~11 12~17 18~23 24~28.........
    for (let i=0;i<=7;i++){
        if(i<=3){
            underDeck[i]=shuffleCardDeck.splice(0,7);
        }else{
            underDeck[i]=shuffleCardDeck.splice(0,6);
        }
    }
}
newCards()

// 花色
let cardSuits = function(idx) {
    let suit = Math.floor( (idx - 1) / 13);
    if(suit==0){
        return 'S'; //Spade
    } else if(suit==1){
        return 'H'; //Heart
    } else if(suit==2){
        return 'D'; //Dimond
    } else if(suit==3){
        return 'C'; //Club
    }
} 

// 比對花色
let pairCardSuits = function(idx){
    let k = Math.ceil(idx / 13);
    return k
}

// 比對數字用
let cardNum = function(idx) {
    let n = idx % 13;
    if(n == 0){
        return 13;
    }else{
        return n;
    }
}

// 比對下方牌堆接牌規則
let parCard = function(child , mom) {
    // child 為要接下去的新卡，故要為 mom 減 1
    if( cardNum(child) + 1 == cardNum(mom)) {
        // 相加等於5即為同顏色，兩者相等即為同花色，皆不符合規定。
        if (pairCardSuits(child) + pairCardSuits(mom) !== 5 && pairCardSuits(child) != pairCardSuits(mom)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


/* 將所有牌堆渲染到畫面上 */
let medsection = document.getElementById('medsection'); //抓中央牌區的把拔
let freshUnderView = function(){  //渲染中央牌區元素
    underDeck.forEach((decks,index) =>{   //把每個牌堆放進html元素
        const medDeck = document.createElement('div');
        medDeck.id = `under-deck-${index}`;
        medDeck.className = 'deck';
        medDeck.deck = 'under';
        decks.forEach((cards,cardIndex) =>{ //把牌堆裡的卡也放進html元素
            const underCard = document.createElement('div');
            underCard.draggable = true;
            underCard.id = `card${cards}`;
            underCard.className='cardbox0';
            underCard.deck = `under${index}`;
            underCard.number = cards;
            underCard.style.animation = `newEffect .5s ${3+cardIndex/2}s backwards`              
            underCard.style.backgroundImage = `url(static/cards_background/${cardSuits(cards)}${cardNum(cards)}.png)`;

            medDeck.appendChild(underCard); //卡片放進牌堆
        })
        medsection.appendChild(medDeck);  //牌堆放進中央牌區
    })
}
freshUnderView();

let rightCardDeck = document.getElementById('rightCardDeck'); //一樣，抓右上牌區父層
let freshRightView = function(){  //渲染右上成功排序區
    rightDeck.forEach((decks,index) => {
        const deckTR = document.createElement('div');
        deckTR.id = `right-deck-${index}`;
        deckTR.className = 'deck';
        deckTR.deck = 'right'
        decks.forEach((cards,cardIndex) => {
            const rightCard = document.createElement('div');

            rightCard.draggable = true;
            
            rightCard.id = `card${cards}`;
            rightCard.className= 'cardbox0';
            rightCard.deck = `right${index}`;
            rightCard.number = cards;

            rightCard.style.backgroundImage = `url(img/card/poker-${kindColor(cards)}${cardNum(cards)}.svg)`;

            deckTR.appendChild(rightCard);
        })
        rightCardDeck.appendChild(deckTR);
    })
}

let leftCardDeck = document.getElementById('leftCardDeck'); // 抓右上牌區父層
let freshLeftView = function(){ //左上牌區
    leftDeck.forEach((decks,index) => {
        const deckTL = document.createElement('div');
        deckTL.id = `left-deck-${index}`;
        deckTL.className = 'deck';
        deckTL.deck = 'left';
        decks.forEach((cards,cardIndex) => {
            const leftCard = document.createElement('div');

            leftCard.draggable = true;

            leftCard.id = `card${cardIndex}`;
            leftCard.className= 'cardbox0';
            leftCard.number = cards;
            leftCard.deck = `left${index}`;

            leftCard.style.backgroundImage = `url(img/card/poker-${kindColor(cards)}${cardNum(cards)}.svg)`;

            deckTL.appendChild(leftCard);
        })
        leftCardDeck.appendChild(deckTL);
    })
}

/* 設定draggable以及牌堆巢狀（疊牌） */
function beginSerch(){
    let serchCards = document.querySelectorAll('[draggable="true"]');
    serchCards.forEach((item) => {
        item.draggable = false;
    })
    //全部整理成巢狀結構
    for(let i=0 ; i < underDeck.length ; i++){  //從原始陣列抓，用複製的也可以
        let outerDeck = document.querySelector('#under-deck-'+i)
        for(let p=underDeck[i].length-1 ; p >= 1 ; p--){
            let numC = underDeck[i].slice(p,p+1);
            let numM = underDeck[i].slice(p-1,p);
            let cardC = document.querySelector('#card'+numC);
            let cardM = document.querySelector('#card'+numM);
            outerDeck.removeChild(cardC);
            cardM.appendChild(cardC);
        }
    }
    //從複製的陣列抓每組最後一個數設可拖動
    let lastCard = []  //存起來最後一張牌(也有可能有些牌堆沒牌)
    let len = copyUnderDeck.length;
    for(let i = 0 ; i < len ; i++ ){  //從複製的陣列抓每組最後一個數設可拖動
        let c = copyUnderDeck[i].slice(-1);
        let C = document.querySelector('#card'+c);
        C.draggable = true;
        lastCard.push(C);
    }
    //判斷最後一張元素的父層是否可拖動
    let last2Card = [];
    parentDraggable(lastCard, last2Card);
    // //判斷最後第二張 ~ 第十二張元素的父層是否可拖動（接龍 K ~ 2為12張，但這樣寫好醜...有時間再改）
    if (last2Card.length > 0){
        let last3Card = [];
        parentDraggable(last2Card, last3Card);
        if(last3Card.length > 0){
            let last4Card = [];
            parentDraggable(last3Card, last4Card);
            if(last4Card.length > 0){
                let last5Card = [];
                parentDraggable(last4Card, last5Card);
                if(last5Card.length > 0){
                    let last6Card = [];
                    parentDraggable(last5Card, last6Card);
                    if(last6Card.length > 0){
                        let last7Card = [];
                        parentDraggable(last6Card, last7Card);
                        if(last7Card.length > 0){
                            let last8Card = [];
                            parentDraggable(last7Card, last8Card);
                            if(last8Card.length > 0){
                                let last9Card = [];
                                parentDraggable(last8Card, last9Card);
                                if(last9Card.length > 0){
                                    let last10Card = [];
                                    parentDraggable(last9Card, last10Card);
                                    if(last10Card.length > 0){
                                        let last11Card = [];
                                        parentDraggable(last10Card, last11Card);
                                        if(last11Card.length > 0){
                                            let last12Card = [];
                                            parentDraggable(last11Card, last12Card);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    let eff = document.querySelectorAll('[draggable="true"]');
    eff.forEach((item) => {
        item.classList.add('hover');
    })
}

// 判斷父層元素是否可拉動
function parentDraggable(child,dad){  //用於判斷上層可否拖動
    if(child.length>0){
        for(let i=0; i<child.length; i++){
            if(child[i].parentNode.deck == 'under') return //判斷上層是不是到deck了
            if(pairCard(child[i].number, child[i].parentNode.number)){
                child[i].parentNode.draggable = true;
                dad.push(child[i].parentNode);
            }
        }
    }
}

beginSerch();






// btn
function newGame() {
    // 洗牌重發

    // 重新計時

}


