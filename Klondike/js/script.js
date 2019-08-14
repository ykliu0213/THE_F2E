
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

// 備份排堆
for(let i = 0 ; i < underDeck.length ; i++){
    copyUnderDeck[i] = underDeck[i].slice(0);
}


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
let pairCard = function(child , mom) {
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

// 原<div>為由右至左，在此反過來設定，由左至右
let rightCardDeck = document.getElementById('rightCardDeck'); //一樣，抓右上牌區父層
let freshRightView = function(){  //渲染右上成功排序區
    console.log(rightCardDeck);
    for(let i = 0 ; i < rightCardDeck.childElementCount; i++){
        rightCardDeck.children[i].id = `right-deck-${3-i}`;
        rightCardDeck.children[i].deck = 'right';
    }
}

// 由左至右
let leftCardDeck = document.getElementById('leftCardDeck'); // 抓左上牌區父層
let freshLeftView = function(){ //左上牌區
    console.log(leftCardDeck);
    console.log(leftCardDeck.childElementCount);
    for(let i = 0 ; i < leftCardDeck.childElementCount; i++){
        leftCardDeck.children[i].id = `left-deck-${i}`;
        leftCardDeck.children[i].deck = 'left';
    }
}
// 暫時
freshRightView()
freshLeftView()




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
    // 判斷最後一張元素的父層是否可拖動
    let last2Card = [];
    parentDraggable(lastCard, last2Card);
    // 判斷最後第二張 ~ 第十二張元素的父層是否可拖動（接龍 K ~ 2為12張，但這樣寫好醜...有時間再改）
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
    console.log("parentDraggable");
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
beginSerch(); // 暫時

function serchDraggable(){  //先把亂牌區的牌都設為不能拖曳
    let len = copyUnderDeck.length;
    for(let i=0 ; i < len ; i++ ){
        if(copyUnderDeck[i].length > 0){
            for(let r=0;r<copyUnderDeck[i].length;r++){
                let deckss = copyUnderDeck[i];
                let Fcard = document.querySelector('#card'+deckss[r]);
                Fcard.draggable = false;
                Fcard.classList.remove('hover');
            }
        }
    }
    let lastCard = []; //先找各牌堆最後一張牌
    for(let i=0; i<copyUnderDeck.length; i++){
        if(copyUnderDeck[i].length>0){  //牌堆有牌才做設定
            let c = copyUnderDeck[i].slice(-1);
            let C = document.querySelector('#card'+c);
            C.draggable = true;
            lastCard.push(C);
        }
    }
    let bouns = 0;  //設定左上剩多少空位
    for(let i=0;i<copyLeftDeck.length;i++){
        if(copyLeftDeck[i].length < 1){
            bouns++;
        }
    }
    if(lastCard.length > 0){
        let last2Card = [];
        parentDraggable(lastCard, last2Card);
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
    }
    let serchCards = document.querySelectorAll('[draggable="true"]');
    serchCards.forEach((item) => {
        item.classList.add('hover');
    })
}
function childrenAttr(child){
    if(child.children){  //把其子孫都更改牌區屬性
        let child1 = child.children;
        child1.deck = 'under'+child.deck.slice(-1);
        if(child1.children){
            let child2 = child1.children;
            child2.deck = 'under'+child.deck.slice(-1);
            if(child2.children){
                let child3 = child2.children;
                child3.deck = 'under'+child.deck.slice(-1);
                if(child3.children){
                    let child4 = child3.children;
                    child4.deck = 'under'+child.deck.slice(-1);
                }
            }
        }
    }
}

// 新增拖曳事件
let rootPage = document.querySelector('#root');
rootPage.addEventListener('dragstart', dragStart);
rootPage.addEventListener("dragend", dragEnd);
rootPage.addEventListener('drop', dropped);
rootPage.addEventListener('dragenter', dragEnter);
rootPage.addEventListener('dragleave', dragLeave);
rootPage.addEventListener('dragover', cancelDefault);

function dragEnter(e){
    cancelDefault(e);
    if(e.target.draggable == true){
        e.target.classList.add('enterEffect');
    }else if(e.target.deck == "left" || e.target.deck == "under"){
        e.target.classList.add('deckEnterEffect');            
    }
}
function dragLeave(e){
    cancelDefault(e);
    if(e.target.draggable == true){
        e.target.classList.remove('enterEffect');
    }else if(e.target.deck == "left" || e.target.deck == "under"){
        e.target.classList.remove('deckEnterEffect');            
    }
}

function cancelDefault (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function dragStart (e) {
    console.log("dragStart");
    e.target.classList.add('dragging');
    e.target.style.animation = `none`;
    e.dataTransfer.setData('text/plain', e.target.id);
    sourceContainerId = e.target.parentElement.id;
    sourceId = e.target.id;           
}
function dragEnd(e){
    console.log("dragEnd");
    e.target.classList.remove('dragging');
    e.target.style.animation = `wave .5s linear backwards`;             
}

function dropped(e){
    console.log("dropped");
    console.log(e.target);
    console.log(e.target.deck);
    if (e.target.id.indexOf('deck')>-1 || e.target.id.indexOf('card')>-1) {//判斷是不是指定的容器
        cancelDefault(e);
        e.target.classList.remove('enterEffect')
        e.target.classList.remove('deckEnterEffect')            
        let id = e.dataTransfer.getData('text/plain');
        if (id==e.target.id) {return;}  //判斷是不是同一張牌
        if (sourceContainerId==e.target.id){return;}  //判斷是不是同一個容器

        if (e.target.deck == 'left'){  //放到左上牌區判斷
            console.log('準備放左上');
            let moveCard = document.querySelector('#' + id)
            moveCard.parentElement.classList.remove('set-full-opacity');    // 此時的parentEle是原位置
            if(moveCard.children.length < 1 ) {  //判斷裡面有沒有包東西
                if(moveCard.deck.indexOf('under')>-1){
                    copyLeftDeck[e.target.id.slice(-1)].push(moveCard.number);
                    copyUnderDeck[moveCard.deck.slice(-1)].pop();   //更新陣列資料
                }
                if(moveCard.deck.indexOf('right')>-1){
                    copyLeftDeck[e.target.id.slice(-1)].push(moveCard.number);
                    copyRightDeck[moveCard.id.slice(-1)].pop();   //更新陣列資料
                    moveCard.classList.remove('on-right-bigger-two');
                    moveCard.classList.remove('on-right');
                }
                if(moveCard.deck.indexOf('left')>-1){
                    copyLeftDeck[e.target.id.slice(-1)].push(moveCard.number);
                    copyLeftDeck[moveCard.deck.slice(-1)].pop();    //更新陣列資料
                }

                moveCard.deck = 'left'+e.target.id.slice(-1);  //更改牌區屬性
                e.target.appendChild(moveCard); 
                moveCard.classList.add('on-left');
                moveCard.parentElement.classList.add('set-full-opacity');   // 此時的parentEle是新位置
                movement.push({ //時光機紀錄
                from:{
                    card: sourceId,
                    deck: sourceContainerId
                },
                to:{
                    deck:e.target.id
                }
                })
                serchDraggable();
            }
        }
        if (e.target.deck.indexOf('right')>-1){  //放到右上判斷
            console.log('準備放右上');
            let moveCard = document.querySelector('#' + id)
            console.log(e.target.id);
            if(moveCard.children.length >=1){return}  //禁止牌裡面有牌
            let mom = document.querySelector('#'+e.target.id);
            // 第一張牌
            if(mom.number === undefined){
                console.log("右上牌堆第一張")
                let cardNum = moveCard.number;
                moveCard.parentElement.classList.remove('set-full-opacity');    // 此時的parentEle是原位置
                if (cardNum === 1 && e.target.id === 'right-deck-0'){   // 黑桃A
                    if(moveCard.deck.indexOf('under')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyUnderDeck[moveCard.deck.slice(-1)].pop();   //更新陣列資料
                    }   //不會有其他同right牌組的牌跑到另一組
                    if(moveCard.deck.indexOf('left')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyLeftDeck[moveCard.deck.slice(-1)].pop();    //更新陣列資料
                    }
                    moveCard.deck = 'right'+e.target.id.slice(-1);    //更改牌區屬性
                    e.target.appendChild(moveCard);
                    moveCard.classList.add('on-right');
                    moveCard.parentElement.classList.add('set-full-opacity');   // 此時的parentEle是新位置
                    movement.push({     //時光機紀錄
                    from:{
                        card: sourceId,
                        deck: sourceContainerId
                    },
                    to:{
                        deck:e.target.id
                    }
                    })
                    serchDraggable();
                }
                if (cardNum === 14 && e.target.id === 'right-deck-1'){   // 愛心A
                    if(moveCard.deck.indexOf('under')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyUnderDeck[moveCard.deck.slice(-1)].pop();   //更新陣列資料
                    }   //不會有其他同right牌組的牌跑到另一組
                    if(moveCard.deck.indexOf('left')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyLeftDeck[moveCard.deck.slice(-1)].pop();    //更新陣列資料
                    }
                    moveCard.deck = 'right'+e.target.id.slice(-1);    //更改牌區屬性
                    e.target.appendChild(moveCard);
                    moveCard.classList.add('on-right');
                    moveCard.parentElement.classList.add('set-full-opacity');   // 此時的parentEle是新位置
                    movement.push({     //時光機紀錄
                    from:{
                        card: sourceId,
                        deck: sourceContainerId
                    },
                    to:{
                        deck:e.target.id
                    }
                    })
                    serchDraggable();
                }
                if (cardNum === 27 && e.target.id === 'right-deck-2'){   // 方塊A
                    if(moveCard.deck.indexOf('under')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyUnderDeck[moveCard.deck.slice(-1)].pop();   //更新陣列資料
                    }   //不會有其他同right牌組的牌跑到另一組
                    if(moveCard.deck.indexOf('left')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyLeftDeck[moveCard.deck.slice(-1)].pop();    //更新陣列資料
                    }
                    moveCard.deck = 'right'+e.target.id.slice(-1);    //更改牌區屬性
                    e.target.appendChild(moveCard);
                    moveCard.classList.add('on-right');
                    moveCard.parentElement.classList.add('set-full-opacity');   // 此時的parentEle是新位置
                    movement.push({     //時光機紀錄
                    from:{
                        card: sourceId,
                        deck: sourceContainerId
                    },
                    to:{
                        deck:e.target.id
                    }
                    })
                    serchDraggable();
                }
                if (cardNum === 40 && e.target.id === 'right-deck-3'){   // 梅花A
                    if(moveCard.deck.indexOf('under')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyUnderDeck[moveCard.deck.slice(-1)].pop();   //更新陣列資料
                    }   //不會有其他同right牌組的牌跑到另一組
                    if(moveCard.deck.indexOf('left')>-1){
                        copyRightDeck[e.target.id.slice(-1)].push(moveCard.number);
                        copyLeftDeck[moveCard.deck.slice(-1)].pop();    //更新陣列資料
                    }
                    moveCard.deck = 'right'+e.target.id.slice(-1);    //更改牌區屬性
                    e.target.appendChild(moveCard);
                    moveCard.classList.add('on-right');
                    moveCard.parentElement.classList.add('set-full-opacity');   // 此時的parentEle是新位置
                    movement.push({     //時光機紀錄
                    from:{
                        card: sourceId,
                        deck: sourceContainerId
                    },
                    to:{
                        deck:e.target.id
                    }
                    })
                    serchDraggable();
                }
            }

            // 第二張開始
            if(mom.number == moveCard.number - 1){
                if(moveCard.deck.indexOf('under')>-1){
                    console.log("movecard: " + moveCard.deck + " & " + moveCard.id);
                    console.log("e.target: " + e.target.deck + " & " + e.target.id);
                    moveCard.classList.add('on-right-bigger-two');
                    moveCard.parentElement.classList.add('set-full-opacity');
                    copyRightDeck[e.target.deck.slice(-1)].push(moveCard.number);
                    copyUnderDeck[moveCard.deck.slice(-1)].pop();   //更新陣列資料
                }   //不會有其他同right牌組的牌跑到另一組
                if(moveCard.deck.indexOf('left')>-1){
                    moveCard.classList.add('on-right-bigger-two');
                    moveCard.parentElement.classList.add('set-full-opacity');
                    copyRightDeck[e.target.deck.slice(-1)].push(moveCard.number);
                    copyLeftDeck[moveCard.deck.slice(-1)].pop();    //更新陣列資料
                    moveCard.classList.remove('on-left');
                }
                moveCard.deck = 'right'+e.target.deck.slice(-1);  //更改牌區屬性
                e.target.appendChild(moveCard); 
                movement.push({ //時光機紀錄
                from:{
                    card: sourceId,
                    deck: sourceContainerId
                },
                to:{
                    deck:e.target.id
                }
                })
                serchDraggable();
            }
        }
        if (e.target.deck.indexOf('under')>-1){   //放到亂牌區判斷
            console.log("放到亂排堆");
            let moveCard = document.querySelector('#' + id);
            let mom = document.querySelector('#'+e.target.id);
            if(mom.deck == 'under'){//如果是放到空牌堆
                if(moveCard.deck.indexOf('under')>-1){  //更新陣列資料  如果卡片原本是亂牌區
                    let ar = copyUnderDeck[moveCard.deck.slice(-1)]; //找移動牌原本所屬的陣列
                    let index = ar.indexOf(moveCard.number);    //找他的在陣列的位置
                    let ns = ar.splice(index,ar.length-index);  //包括他之後的數字都切掉
                    let ar2 = copyUnderDeck[mom.id.slice(-1)];  //目標容器原本的陣列
                    for(let i=0;i<ns.length;i++){
                        ar2.push(ns[i])
                    }
                }else if(moveCard.deck.indexOf('left')>-1){   //如果卡片原本在左上區
                    moveCard.parentElement.classList.remove('set-full-opacity');
                    let ar = copyLeftDeck[moveCard.deck.slice(-1)];  //原本是左上哪區陣列
                    let ar2 = copyUnderDeck[mom.id.slice(-1)];   //目標陣列
                    moveCard.classList.remove('on-left');
                    moveCard.classList.remove('on-right-bigger-two');
                    ar2.push(moveCard.number)  //因為從左上移一定只有一張
                    ar.pop()   //所以不指定直接刪除就好
                }else if(moveCard.deck.indexOf('right')>-1){ //如果卡片原本在右上
                    moveCard.parentElement.classList.remove('set-full-opacity');
                    let ar = copyRightDeck[moveCard.id.slice(-1)];
                    let ar2 = copyUnderDeck[mom.id.slice(-1)];
                    moveCard.classList.remove('on-right-bigger-two');
                    moveCard.classList.remove('on-right');
                    ar2.push(moveCard.number)  //從右上移也一定只有一張
                    ar.pop()
                }
                moveCard.deck = 'under'+mom.id.slice(-1)  //更改牌區屬性
                childrenAttr(moveCard) //子孫牌都改屬性
                mom.appendChild(moveCard);
                movement.push({
                    from:{
                        card: sourceId,
                        deck: sourceContainerId
                    },
                    to:{
                        deck:e.target.id
                    }
                })
                serchDraggable();
            }else if(pairCard(moveCard.number, mom.number)){ //放到牌上有對花色順序
                if(mom.childElementCount>0)return //避免放到除了最後一張的牌
                if(moveCard.deck.indexOf('under')>-1){  //更新陣列資料  如果卡片原本是亂牌區
                    let ar = copyUnderDeck[moveCard.deck.slice(-1)]; //找移動牌原本所屬的陣列
                    let index = ar.indexOf(moveCard.number);    //找他在陣列的位置
                    let ns = ar.splice(index, ar.length-index);  //包括他之後的數字都切掉
                    let ar2 = copyUnderDeck[mom.deck.slice(-1)];  //目標容器原本的陣列
                    for(let i=0;i<ns.length;i++){
                        ar2.push(ns[i]);
                    }
                }else if(moveCard.deck.indexOf('left')>-1){   //如果卡片原本在左上區
                    moveCard.parentElement.classList.remove('set-full-opacity');
                    let ar = copyLeftDeck[moveCard.deck.slice(-1)];  //原本是左上哪區陣列
                    let ar2 = copyUnderDeck[mom.deck.slice(-1)];   //目標陣列
                    moveCard.classList.remove('on-left');
                    ar2.push(moveCard.number);  //因為從左上移一定只有一張
                    ar.pop();   //所以不指定直接刪除就好
                }else if(moveCard.deck.indexOf('right')>-1){ //如果卡片原本在右上
                    moveCard.parentElement.classList.remove('set-full-opacity');
                    let ar = copyRightDeck[moveCard.id.slice(-1)];
                    let ar2 = copyUnderDeck[mom.deck.slice(-1)];
                    moveCard.classList.remove('on-right');
                    moveCard.classList.remove('on-right-bigger-two');
                    ar2.push(moveCard.number);  //從右上移也一定只有一張
                    ar.pop();
                }
                moveCard.deck = 'under'+mom.deck.slice(-1)  //更改牌區屬性
                childrenAttr(moveCard) //更改子孫屬性
                mom.appendChild(moveCard);
                movement.push({
                    from:{
                        card: sourceId,
                        deck: sourceContainerId
                    },
                    to:{
                        deck:e.target.id
                    }
                })
                serchDraggable();
            }
        } 
    }
    isFinish();
}

// 檢查是否完成
function isFinish(){
    if(copyRightDeck[0].length !==13)return;
    if(copyRightDeck[1].length !==13)return;
    if(copyRightDeck[2].length !==13)return;
    if(copyRightDeck[3].length !==13)return;
    // winPage.classList.add('show');
    pause()
}

// undo
function undo(){
    if (movement.length===0) return;
    let lastMove = movement.pop();

    let beginDeck = document.querySelector('#' + lastMove.from.deck);
    let cardMoved = document.querySelector('#' + lastMove.from.card);
    let finishDeck = document.querySelector('#' + lastMove.to.deck);
    //復原屬性
    if(beginDeck.deck.indexOf('under')>-1){ //如果是從亂牌堆來的
        if(beginDeck.deck == 'under'){ //假設是從空牌堆來
            let attr = 'under' + beginDeck.id.slice(-1)
            cardMoved.deck = attr  //復原原本牌的屬性
            childrenAttr(cardMoved)  //有子孫的話也改回來
        }else{//其他就表示從有牌的牌堆來
            let attr = 'under' + beginDeck.deck.slice(-1)
            cardMoved.deck = attr
            childrenAttr(cardMoved)  //有子孫的話也改回來
        }
        //復原陣列
        let ar = copyUnderDeck[cardMoved.deck.slice(-1)] //原本所在陣列
        if(finishDeck.deck == 'left'){ //左上復原(一定是放在空牌堆上，只會移一張)
            let ar2 = copyLeftDeck[finishDeck.id.slice(-1)]
            ar2.pop()
            ar.push(cardMoved.number)
        }else if(finishDeck.deck.indexOf('right')>-1){ //右上復原(只會移一張，因預設的關係所以一定會放在牌上，先不做無ace在右上預設的情況)
            let ar2 = copyRightDeck[finishDeck.deck.slice(-1)]
            ar2.pop()
            ar.push(cardMoved.number)
        }else if(finishDeck.deck.indexOf('under')>-1){ //下方復原（會移多張，有可能在空牌）
            if(finishDeck.deck == 'under'){ //空牌堆的話
                let ar2 = copyUnderDeck[finishDeck.id.slice(-1)] //找到從哪裏復原的陣列
                let index = ar2.indexOf(cardMoved.number)    //找他在陣列的位置
                let ns = ar2.splice(index, ar2.length-index)  //包括他之後的數字都切掉
                for(let i=0;i<ns.length;i++){  //一個一個放
                    ar.push(ns[i])
                }
            }else{ //有牌的話
                let ar2 = copyUnderDeck[finishDeck.deck.slice(-1)]
                let index = ar2.indexOf(cardMoved.number)
                let ns = ar2.splice(index, ar2.length-index)
                for(let i=0; i<ns.length;i++){
                    ar.push(ns[i])
                }
            }
        }
    }else if(beginDeck.deck.indexOf('left')>-1){ //如果原來從左上來的(一定在空牌堆上，只有一張)
        let attr = 'left' + beginDeck.id.slice(-1)
        cardMoved.deck = attr
        let ar = copyLeftDeck[cardMoved.deck.slice(-1)]
        if(finishDeck.deck == 'left'){
            let ar2 = copyLeftDeck[finishDeck.id.slice(-1)]
            ar2.pop()
            ar.push(cardMoved.number)
        }else if(finishDeck.deck.indexOf('right')>-1){
            let ar2 = copyRightDeck[finishDeck.deck.slice(-1)] //右上復原(未寫如果是空牌堆的情況)
            ar2.pop()
            ar.push(cardMoved.number)
        }else if(finishDeck.deck.indexOf('under')>-1){
            if(finishDeck.deck == 'under'){
                let ar2 = copyUnderDeck[finishDeck.id.slice(-1)]
                ar2.pop()
                ar.push(cardMoved.number)
            }else{
                let ar2 = copyUnderDeck[finishDeck.deck.slice(-1)]
                ar2.pop()
                ar.push(cardMoved.number)
            }
        }
    }else if(beginDeck.deck.indexOf('right')>-1){ //如果原來從右上來(只會移一張)(未寫如果是空牌堆的情況)
        let attr = "right" + beginDeck.deck.slice(-1)
        cardMoved.deck = attr
        let ar = copyRightDeck[cardMoved.deck.slice(-1)]
        if(finishDeck.deck == 'left'){
            let ar2 = copyLeftDeck[finishDeck.id.slice(-1)]
            ar2.pop()
            ar.push(cardMoved.number)
            //預設不會有其他右上牌移到右上的情況
        }else if(finishDeck.deck.indexOf('under')>-1){
            if(finishDeck.deck == 'under'){
                let ar2 = copyUnderDeck[finishDeck.id.slice(-1)]
                ar2.pop()
                ar.push(cardMoved.number)
            }else{
                let ar2 = copyUnderDeck[finishDeck.id.slice(-1)]
                ar2.pop()
                ar.push(cardMoved.number)
            }
        }
    }
    finishDeck.removeChild(cardMoved);
    beginDeck.appendChild(cardMoved);
    // console.log(copyUnderDeck)
    // console.log(copyLeftDeck)
    // console.log(copyRightDeck)
    serchDraggable();
}

// restart
function reStart(){
    console.log("reStart!");
    time = 0;
    clock.innerHTML = '00:00';
    // winPage.classList.remove('show')
    if(movement.length < 1) return
    leftCardDeck.innerHTML = '';
    rightCardDeck.innerHTML = '';
    medsection.innerHTML = '';
    copyLeftDeck = [[], [], [], []];
    copyRightDeck = [[], [], [], []];
    for(let i=0;i<underDeck.length;i++){
        copyUnderDeck[i] = underDeck[i].slice(0) 
    }
    movement = [];
    freshUnderView();
    freshLeftView();
    freshRightView();
    beginSerch();
}

// new game
function newGame(){
    time = 0;
    clock.innerHTML = '00:00';
    // winPage.classList.remove('show')
    leftCardDeck.innerHTML = '';
    rightCardDeck.innerHTML = '';
    medsection.innerHTML = '';
    movement = [];
    copyLeftDeck = [[], [], [], []];
    copyRightDeck = [[], [], [], []];
    underDeck = [[], [], [], [], [], [], [], []];
    newCards()
    for(let i=0;i<underDeck.length;i++){
        copyUnderDeck[i] = underDeck[i].slice(0) 
    }
    freshUnderView();
    freshLeftView();
    freshRightView();
    beginSerch();
    loadPage.style.display = 'block'
    setTimeout(function(){counting();}, 6000)
}

// btn
function newGame() {
    // 洗牌重發
    // 重新計時
    location.reload();
}


// btn 新增點擊事件
const undoBtn = document.querySelector('#undo');
undoBtn.addEventListener('click',undo);
const newGameBtn = document.querySelector('#newGame');
newGameBtn.addEventListener('click',newGame);
const hintBtn = document.querySelector('#hint');

// restart尚未修正，暫且以newGame替代
const reStartBtn = document.querySelector('#reStart');
reStartBtn.addEventListener('click',newGame);   // 待修正

