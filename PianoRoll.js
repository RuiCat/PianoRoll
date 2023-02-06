// 钢琴窗控件
class PianoRoll {
    constructor(element, length, width, height, gridWidth) {
        var $ = this;
        // 歌词列表
        $.LyricsList = [];
        // 构建参数
        $.parameter = {
            length: length ? length * 4 : 400,
            width: width ? width + "px" : "100%",
            height: height ? height + "px" : "100%",
            gridWidth: gridWidth ? gridWidth : 100,
        }
        // 元素
        $.element = {
            pianoroll: document.createElement("div"),
            container: document.createElement("div"),
        }
        $.element.pianoroll.style.width = $.parameter.width;
        $.element.pianoroll.style.height = $.parameter.height;
        $.element.pianoroll.setAttribute("class", "pianoroll");
        $.element.container.style.height = "2700px";
        $.element.container.style.width = $.parameter.length * $.parameter.gridWidth + 75 + "px";
        // 绘制背景层
        var draw = SVG().addTo($.element.pianoroll.appendChild($.element.container)).size("100%", "100%").stroke({ width: 1 });
        var linedraw = draw.group().fill("#666"); linedraw.line(0, 0, 0, 2700).stroke({ color: "#666" });
        $.element.backdrop = draw
        $.nodeList = [
            draw.group(),
            draw.group().stroke({ color: "#AFA" }),
            draw.group().stroke({ color: "#000" }),
            draw.group().stroke({ color: "#AF0" }),
            draw.group().stroke({ color: "#AFF" }),
            linedraw,
            draw.group().fill("#000").path("M10,12 C11.1045695,12 12,11.1045695 12,10 C12,8.8954305 11.1045695,8 10,8 C8.8954305,8 8,8.8954305 8,10 C8,11.1045695 8.8954305,12 10,12 Z M10,6 C11.1045695,6 12,5.1045695 12,4 C12,2.8954305 11.1045695,2 10,2 C8.8954305,2 8,2.8954305 8,4 C8,5.1045695 8.8954305,6 10,6 Z M10,18 C11.1045695,18 12,17.1045695 12,16 C12,14.8954305 11.1045695,14 10,14 C8.8954305,14 8,14.8954305 8,16 C8,17.1045695 8.8954305,18 10,18 Z").hide(),
        ];
        // 绘制
        $.Draw();
        // 轴线
        var linedtext = linedraw.text("").move(10, 20);
        // 绑定事件处理
        $.element.pianoroll.addEventListener('mousemove', function (e) {
            let i = e.layerX; if (i > 75 && e.target.tagName != "DIV") { linedraw.x(i); linedtext.text("Time " + String((i - 75) / 200)); } else { linedraw.x(75); };
            $.Event(e)
        });
        $.element.pianoroll.addEventListener('scroll', function (e) { linedtext.y($.element.pianoroll.scrollTop); $.Event(e) });
        $.element.pianoroll.addEventListener('mouseout', function (e) { $.Event(e) });
        $.element.pianoroll.addEventListener('mouseover', function (e) { $.Event(e) });
        $.element.pianoroll.addEventListener('mouseup', function (e) { $.Event(e) });
        $.element.pianoroll.addEventListener('mousedown', function (e) { $.Event(e) });
        // 完成创建
        element.appendChild($.element.pianoroll);
    };
    // 绘制背景层
    Draw() {
        var draw = this.nodeList;
        var parameter = this.parameter;
        // 绘制对象
        var text = draw[0].clear();
        var line = draw[1].clear();
        var rect = draw[2].clear();
        var gridline = draw[3].clear();
        var gridlist = draw[4].clear();
        // 参数
        var width = parameter.gridWidth;// 宽度
        var length = parameter.length * width + 75;
        // 绘制按键
        var i = 12.5;
        for (let c = 0; c < 9; c++) {
            for (let l of [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 3, 0, 1, 2, 1, 0, 1, 2, 4, 0, 3]) {
                switch (l) {
                    case 2: line.line(50, i, 75, i); rect.rect(50, 15).move(0, i - 7.5); break;
                    case 4: text.text('C' + (8 - c)).move(50, i); break;
                    case 3: line.line(0, i, 75, i); break;
                }
                // 绘制行
                switch (l) {
                    case 4: case 3: case 1: gridline.line(75, i, length, i); break;
                }
                i += 12.5;
            }
        }
        // 绘制列
        var l = 0;
        for (let i = width + 25; i <= length; i += width) {
            (l % 4 ? gridline : gridlist).line(i, 0, i, 2700);
            l++;
        }
    };
    // 事件
    Event(e) { for (let lyrics of this.LyricsList) { lyrics.Event(e) } };
};


// 钢琴窗词谱控件
class PianoRollScore {
    constructor(pianoRoll, id) {
        if (!pianoRoll instanceof PianoRoll) { return null };
        this.id = id;
        this.drawSvg = SVG().addTo(pianoRoll.element.container).size("100%", "100%");
        this.drawWord = this.drawSvg.group();
        this.drawCurve = this.drawSvg.group().stroke({ color: "#666" }).fill("none");
        this.pianoRoll = pianoRoll;
        this.tuningCurve = [];
        this.thesaurusList = [];
        pianoRoll.LyricsList.push(this);
    }
    // text,note 音符,timing 起始时间, pitch 音高, syllable 音节, length 音长
    AddWord(text = '', note = '-', timing = 0, pitch = 0, syllable = 0, length = 4) {
        return new PianoRollScoreWord(this, text, note, timing + parseInt(syllable / 4), pitch, syllable % 4, length);
    }
    // timing 起始时间, pitch 音高
    AddCurve(timing = 0, pitch = 0) {
        return new PianoRollScoreCurve(this, timing, pitch);
    }
    // 绘制
    Draw() {
        for (let word of this.thesaurusList) { word.Draw(); }
        for (let tuning of this.tuningCurve) { tuning.Draw(); }
    }
    // 事件
    eventValue = null;
    Event(e) {
        if (this.eventValue != null) {
            if (this.eventValue.Event(e) == false) { this.eventValue = null; } // 转发事件到拦截对象
        } else {
            for (var node = e.target; node && node.tagName != 'g'; node = node.parentNode) { } // 得到绑定事件的 g 对象
            if (node && node.instance) { if (node.instance.instance.Event(e)) { this.eventValue = node.instance.instance; }; return; } // 将事件转发给 g 对象
        }
    }
}

// 钢琴窗词谱的词显示控件
class PianoRollScoreWord {
    // text,note 音符,timing 起始时间, pitch 音高, syllable 音节, length 音长
    constructor($, text = '', note = '-', timing = 0, pitch = 0, syllable = 0, length = 4) {
        if (!$ instanceof PianoRollScore) { return null };
        this.__proto__.__proto__ = $;
        this.indexOf = this.thesaurusList.push(this) - 1;
        // 构建显示
        this.group = this.drawWord.group();
        this.group.instance = this;
        this.group.rect(0, 24).fill("#A0F0F0A0");
        this.group.text("");
        this.group.text("");
        // 参数设置
        this._text = text;
        this._note = note;
        this._pitch = pitch;
        this._timing = timing;
        this._length = length;
        this._syllable = syllable;
        this.Draw();
    }
    // 值处理
    set text(text) { this._text = text; this.Draw(false); }
    get text() { return this._text; }
    set note(note) { this._note = note; this.Draw(false); }
    get note() { return this._note; }
    set pitch(pitch) { this._pitch = pitch; this.Draw(); }
    get pitch() { return this._pitch; }
    set timing(timing) { this._timing = timing; this.Draw(); }
    get timing() { return this._timing; }
    set length(length) { this._length = length; this.Draw(); }
    get length() { return this._length; }
    set syllable(syllable) { this._syllable = syllable; this.Draw(); }
    get syllable() { return this._syllable; }
    // 计算坐标
    calculateCoordinates() {
        var parameter = this.pianoRoll.parameter;
        this.x = (this.timing * (parameter.gridWidth * 4)) + (this.syllable * parameter.gridWidth) + 75;
        this.y = this.pitch * 25;
        this.z = this.length * parameter.gridWidth;
    }
    // 绘制
    Draw(isMove = false) {
        if (!isMove) {
            this.calculateCoordinates();
        }
        this.group.get(0).width(this.z).attr('x', this.x).attr('y', this.y);
        this.group.get(1).text(this._text).attr('x', this.x).attr('y', this.y + 20);
        this.group.get(2).text(this._note).attr('x', this.x).attr('y', this.y + 40);
    };
    // 事件
    eventValue = { isMove: false, clientX: 0, clientY: 0, cX: 0, cY: 0 };
    Event(e) {
        var parameter = this.pianoRoll.parameter;
        switch (e.type) {
            case 'onscroll': // 滚动条事件
                break;
            case 'mouseout': // 鼠标移出
                break;
            case 'mouseover': // 鼠标移入
                break;
            case 'mousemove': // 鼠标移动
                if (this.eventValue.isMove) {
                    // 限制坐标
                    var x = e.clientX - this.eventValue.clientX + this.eventValue.cX;
                    var x1 = this.thesaurusList[this.indexOf - 1]; x1 = x1 ? (x1.x + x1.z) : 75;
                    var x2 = this.thesaurusList[this.indexOf + 1]; x2 = x2 ? (x2.x - this.z) : -1;
                    if (!(x + 1 > x1)) {
                        this.x = x1;
                    } else if (x2 != -1 && x2 < x) {
                        this.x = x2;
                    } else {
                        this.x = x;
                    }
                    // 移动坐标
                    this.y = e.clientY - this.eventValue.clientY + this.eventValue.cY;
                    this.Draw(true);
                    return true
                } else if (this.eventValue.isLength) {
                    var x1 = e.clientX - this.eventValue.clientX + this.eventValue.cX;
                    this.z = this.eventValue.cY > x1 ? x1 : this.eventValue.cY;
                    this.pianoRoll.nodeList[6].show().move(this.x + this.z - 10, this.y + 5);
                    this.Draw(true);
                    return true
                }
                break;
            case 'mouseup': // 鼠标弹起
                if (this.eventValue.isMove) {
                    var timing = (this.x - 75);
                    this._timing = parseInt(timing / (parameter.gridWidth * 4));
                    this._pitch = Math.round(this.y / 25);
                    this._syllable = parseInt((timing / (parameter.gridWidth)) % 4);
                } else if (this.eventValue.isLength) {
                    this._length += Math.round((this.z - this.eventValue.cX) / parameter.gridWidth);
                    this._length = this._length > 0 ? this._length : 1;
                    this.pianoRoll.nodeList[6].hide();
                } else { break; }
                this.eventValue.isLength = false;
                this.eventValue.isMove = false;
                this.Draw();
                return false
            case 'mousedown': // 鼠标按下
                var xz = this.x + this.z;
                if (xz - e.layerX < 10) {
                    this.eventValue.isLength = true;
                    this.eventValue.cX = this.z;
                    var x = this.thesaurusList[this.indexOf + 1];
                    this.eventValue.cY = (x ? x.x : parameter.length * parameter.gridWidth) - this.x;
                    this.eventValue.clientX = e.clientX;
                    this.pianoRoll.nodeList[6].show().move(xz - 10, this.y + 5);
                    return true
                } else if (this.eventValue.isMove == false) {
                    this.eventValue.isMove = true;
                    this.eventValue.clientX = e.clientX;
                    this.eventValue.clientY = e.clientY;
                    this.eventValue.cX = this.x;
                    this.eventValue.cY = this.y;
                    return true
                }
                break;
        }
    }
}

class PianoRollScoreCurve {
    constructor($, timing, pitch) {
        if (!$ instanceof PianoRollScoreCurve) { return null };
        this.__proto__.__proto__ = $;
        this.indexOf = this.tuningCurve.push(this) - 1;
        // 构建显示
        this.group = this.drawCurve.group();
        this.group.instance = this;
        this.curve = this.group.path();
        this.circle = this.group.circle(10).fill("#A0F0F0A0");;
        // 参数设置
        this._pitch = pitch;
        this._timing = timing;
        // 绘制
        this.Draw();
    }
    set pitch(pitch) { this._pitch = pitch; this.Draw(); }
    get pitch() { return this._pitch; }
    set timing(timing) { this._timing = timing; this.Draw(); }
    calculateCoordinates() {
        this.x = this._timing * this.pianoRoll.parameter.gridWidth + 75
        this.y = this._pitch * 25
    }
    // 绘制
    Draw(isMove = false) {
        if (!isMove) {
            this.calculateCoordinates();
        }
        if (this.indexOf > 0) {
            var node = this.tuningCurve[this.indexOf - 1];
            this.curve.plot(['M', node.x, node.y, 'L', this.x, this.y]);
        }
        this.circle.center(this.x, this.y);
    }
    // 事件
    eventValue = { isMove: false, clientX: 0, clientY: 0, cX: 0, cY: 0 };
    Event(e) {
        switch (e.type) {
            case 'onscroll': // 滚动条事件
                break;
            case 'mouseout': // 鼠标移出
                break;
            case 'mouseover': // 鼠标移入
                break;
            case 'mousemove': // 鼠标移动
                if (this.eventValue.isMove) {
                    var x = e.clientX - this.eventValue.clientX + this.eventValue.cX;
                    var x1 = this.tuningCurve[this.indexOf - 1]; x1 = x1 ? (x1.x) : 75;
                    var x2 = this.tuningCurve[this.indexOf + 1]; x2 = x2 ? (x2.x) : -1;
                    if (!(x + 1 > x1)) {
                        this.x = x1;
                    } else if (x2 != -1 && x2 < x) {
                        this.x = x2;
                    } else {
                        this.x = x;
                    }
                    this.y = e.clientY - this.eventValue.clientY + this.eventValue.cY
                    this.tuningCurve[this.indexOf + 1]?.Draw(true);
                    this.Draw(true);
                }
                break;
            case 'mouseup': // 鼠标弹起
                if (this.eventValue.isMove) {
                    this.eventValue.isMove = false;
                    this._timing = parseInt((this.x - 75) / (this.pianoRoll.parameter.gridWidth));
                    this._pitch = Math.round(this.y / 25);
                    this.Draw(); this.tuningCurve[this.indexOf + 1]?.Draw();
                }
                return false
            case 'mousedown': // 鼠标按下
                if (e.target.tagName != "circle") { return }
                this.eventValue.isMove = true;
                this.eventValue.clientX = e.clientX;
                this.eventValue.clientY = e.clientY;
                this.eventValue.cX = this.x;
                this.eventValue.cY = this.y;
                return true
        }
    }
}