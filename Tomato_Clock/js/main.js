const Start = document.querySelector('.Start');
const StopWatch = document.querySelector('.clock-time');

var min = 25;
var second = 00;
var millisecond = 100;
var secposition = '';

function StartStopWatch(){
  var interval;
  this.start = ()=> {  
    interval =  setInterval(()=>{
        millisecond --;
        
        if(millisecond <= 0){
            second--;
            millisecond = 100;
        }
        if(second <= 0){  
            min--;
            second = 59 ;
        }

        if( second == 59 && millisecond == 100 && min == -1 ){
            stop();
            min = 5;
            second = 0;
            millisecond = 0;                   
        }

        if(second<10){
            secposition = '0';
        }    
        StopWatch.innerHTML=`${min}:${secposition}${second}`;
    },10);
    this.isOn = true;
    }
    

   this.stop =()=>{
       clearInterval(interval);
       this.isOn = false;
   }
};

var stopwatch = new StartStopWatch();

function start(){
    Start.innerHTML = `<span style="color:#ffedf7;"><i class="far fa-stop-circle fa-5x"></i></span>`;
    stopwatch.start();
}

function stop(){
    Start.innerHTML = `<span style="color:#ffedf7;"><i class="far fa-play-circle fa-5x"></i></span>`;
    stopwatch.stop();
}


Start.addEventListener('click',function(){
    stopwatch.isOn?stop():start();
},false);

