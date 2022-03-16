window.onload = function () {
    let isLock = false;
    /**
     * 文件选择相关
     */
    // 获取input
    let inputObj = document.getElementById('inputFile');
    // 获取时间
    let timeBoxObj = document.getElementById('time_box');
    let timeObj = document.getElementById('time');
    // 获取img
    let imgObj = document.getElementById('showImg');
    inputObj.addEventListener('change', function () {
        let url = inputObj.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(url);
        fileReader.onload = function () {
            let src = fileReader.result;
            imgObj.src = src;
            imgObj.style.display = 'block';
        };
    });
    /**
     * 输入框行列输入控制
     */
    let rowObj = document.getElementById('row');
    let colObj = document.getElementById('col');
    // 全局变量
    let rowNum = 0, colNum = 0, boxWidth = 0, boxHeight = 0, cellWidth = 0, cellHeight = 0;
    firstIndex = null;
    /**
     * 拼图区域
     */
    let game_box = document.getElementById('game_box');
    // 图片原始索引
    let imgOrigArr = [];
    // 打乱的图片索引
    let imgRandomArr = [];
    /**
     * 开始游戏
     */
    let myTimer = null;
    // 获取btn
    let btnObj = document.getElementById('startGame');
    btnObj.addEventListener('click', function () {
        if (isLock) {
            return;//正在游戏中
        }
        if (!imgObj.src) {
            alert('请先上传图片');
            return;
        }
        // 行列数
        rowNum = Number(rowObj.value);
        colNum = Number(colObj.value);
        const reg = /^[2-9]\d*$/;
        if (!reg.test(rowNum)) {
            alert('行为大于1的整数');
            return;
        }
        if (!reg.test(colNum)) {
            alert('列为大于1的整数');
            return;
        }
        boxWidth = game_box.offsetWidth;
        boxHeight = game_box.offsetHeight;
        cellWidth = boxWidth / colNum;
        cellHeight = boxHeight / rowNum;
        game_box.innerHTML = '';
        imgCells = [];
        imgOrigArr = [];
        imgRandomArr = [];
        firstIndex = null;
        cellSplitDefault();
        isLock = true;
        document.getElementById('inputFile').style.display = 'none';
        btnObj.style.display = 'none';
        randomImgFunc();
        addToBody();
        timeBeginning();
    });
    /**
     * 开始游戏，计时开始
     */
    function timeBeginning() {
        timeBoxObj.style.display = 'block';
        timeObj.innerText = '00时00分00秒';
        myTimer = null;
        clearInterval(myTimer);
        let myTime = 0,
            hour = 0,
            minute = 0,
            second = 0;//初始化时间默认值 
        myTimer = setInterval(() => {
            if (myTime > 0) {
                hour = Math.floor(myTime / (60 * 60));
                minute = Math.floor(myTime / 60) - (hour * 60);
                second = Math.floor(myTime) - (hour * 60 * 60) - (minute * 60);
            }
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            timeObj.innerText = `${hour}时${minute}分${second}秒`;
            myTime++;
        }, 1000);
    };

    /**
     * 切割图片,生成单元格，默认排序
     */
    let imgCells = [], rotateList = [0, 90, 180, 270];
    function cellSplitDefault() {
        let cell = '', index = 0;
        for (let i = 0; i < rowNum; i++) {
            for (let j = 0; j < colNum; j++) {
                cell = document.createElement('div');
                cell.className = 'imgCell';
                cell.index = index++;
                cell.style.width = cellWidth + 'px';
                cell.style.height = cellHeight + 'px';
                cell.style.left = j * cellWidth + 'px';
                cell.style.top = i * cellHeight + 'px';
                cell.style.backgroundImage = 'url(' + imgObj.src + ')';
                cell.style.backgroundSize = colNum + '00% ' + rowNum + '00%';
                cell.style.backgroundPosition = -j * cellWidth + 'px ' + (-i * cellHeight) + 'px';
                cell.style.backgroundOrigin = "border-box";
                cell.style.cursor = "move";
                // 如果行列相等，则随机旋转
                if (rowNum === colNum) {
                    let rotateIndex = Math.floor(Math.random() * rotateList.length);
                    cell.style.transform = "rotate(" + rotateList[rotateIndex] + "deg)";
                }
                imgCells.push(cell);
                // 索引规则：从左到右,从上到下
                imgOrigArr.push(cell.index);
            };
        }
    };
    /**
     * 打乱图片索引
     */
    function randomImgFunc() {
        imgRandomArr = [];
        for (index in imgOrigArr) {
            let randomIndex = Math.floor(Math.random() * imgOrigArr.length);
            if (imgRandomArr.length > 0) {
                while (imgRandomArr.indexOf(randomIndex) > -1) {
                    randomIndex = Math.floor(Math.random() * imgOrigArr.length);
                }
            }
            imgRandomArr.push(randomIndex);
        }
        let isSame = true;
        if (imgRandomArr.length === imgOrigArr.length) {
            for (i in imgOrigArr) {
                if (imgOrigArr[i] !== imgRandomArr[i]) {
                    isSame = false;
                    break;
                }
            }
        }
        if (isSame) {
            randomImgFunc();
        }
    };
    /**
     * 将cell添加到游戏区域
     */
    function addToBody() {
        imgCells.forEach((cell, index) => {
            cell.style.left = imgRandomArr[index] % colNum * cellWidth + 'px';
            cell.style.top = Math.floor(imgRandomArr[index] / colNum) * cellHeight + 'px';
            cell.setAttribute('draggable', true)
            // 绑定事件
            cell.addEventListener('dragstart', function () {
                firstIndex = this.index;
                this.style.border = '2px solid #00de';
            });
            cell.addEventListener('dragover', function (event) {
                event.preventDefault();
            });
            cell.addEventListener('drop', function () {
                if (firstIndex != this.index) {
                    this.style.border = '2px solid #00de';
                    // 交换点击的两个图片的位置
                    cellExchangeFunc(firstIndex, this.index);
                }
            });
            game_box.appendChild(cell);
        });
    };
    /**
     * 交换位置
     */
    function cellExchangeFunc(from, to) {
        const fromCol = imgRandomArr[from] % colNum,
            fromRow = Math.floor(imgRandomArr[from] / colNum),
            toCol = imgRandomArr[to] % colNum,
            toRow = Math.floor(imgRandomArr[to] / colNum);
        // 移动两张图片
        imgCells[from].style.left = toCol * cellWidth + 'px';
        imgCells[from].style.top = toRow * cellHeight + 'px';
        imgCells[to].style.left = fromCol * cellWidth + 'px';
        imgCells[to].style.top = fromRow * cellHeight + 'px';
        // 将乱序数组中的两个值交换位置
        var _temp = imgRandomArr[from];
        imgRandomArr[from] = imgRandomArr[to];
        imgRandomArr[to] = _temp;
        //如果乱序数组和原数组一致，则表示拼图已完成
        if (imgOrigArr.toString() === imgRandomArr.toString()) {
            // 调用成功方法
            success();
        }
        // 交换后情况所有状态
        imgCells.forEach((ele, index) => {
            ele.style.border = "1px solid #ccc";
        });
    };
    /**
     * 成功
     */
    function success() {
        isLock = false;
        setTimeout(function () {
            alert('恭喜您完成拼图!');
            document.getElementById('inputFile').style.display = 'block';
            btnObj.style.display = 'block';
            myTimer = clearInterval(myTimer);
        }, 500);
    }
};