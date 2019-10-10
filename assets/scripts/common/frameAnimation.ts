const { ccclass, property } = cc._decorator;

@ccclass
export default class FrameAnimation extends cc.Component {

    @property({
        displayName: "播放速度",
        tooltip: "多少秒播放一帧"
    })
    private playSpeed: number = 0.1;

    @property({
        type: [cc.SpriteFrame],
        tooltip: "帧图片"
    })
    private spriteFrames: cc.SpriteFrame[] = [];

    @property({
        type: cc.SpriteFrame,
        tooltip: "动画播放完后的禁止状态的图片，如果没有就会显示第一帧"
    })
    private idle: cc.SpriteFrame = null;

    @property({})
    private playOnLoad: boolean = false;

    private sprite: cc.Sprite = null;
    private isPlay: boolean = false;
    /**
     * 帧动画接下来播放哪一帧
     */
    private nextIndex: number = 0;
    /**
     * 当前播放时间
     */
    private timeSum = 0;
    private backFunc: Function = null;
    /**
     * 是否循环播放
     */
    private isLoop: boolean = false;
    /**
     * 是否倒序播放
     */
    private isInvertedPlay: boolean = false;
    /**
     * 动画播放结束后是否恢复为第一帧
     */
    private isFirstFrameInEnd: boolean = true;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
    }

    start() {
        if (this.playOnLoad)
            this.play(true);
    }

    /**
     * 播放帧动画
     * @param isLoop 是否循环播放
     * @param isFirstFrameInEnd 动画播放结束后是否恢复为第一帧
     * @param isInvertedPlay 是否倒序播放一次
     * @param backFunc 动画播放完后将执行该函数
     */
    play(isLoop: boolean, isFirstFrameInEnd: boolean = true, isInvertedPlay: boolean = false, backFunc: Function = null) {
        this.isLoop = isLoop;
        this.backFunc = backFunc;
        this.isFirstFrameInEnd = isFirstFrameInEnd;
        this.nextIndex = 0;
        this.timeSum = 0;
        this.isInvertedPlay = isInvertedPlay;

        if (this.isInvertedPlay) {
            this.spriteFrames.reverse();
        }

        this.setSpriteFrame(this.spriteFrames[this.nextIndex++]);
        this.isPlay = true;
    }

    /**
     * 停止播放,恢复成等待图片，没有就恢复成第一帧
     */
    stop() {
        this.isPlay = false;
        if (this.idle === null)
            this.sprite.spriteFrame = this.spriteFrames[0];
        else
            this.sprite.spriteFrame = this.idle;
    }

    pause() {
        this.isPlay = false;
    }

    continue() {
        this.isPlay = true;
    }

    /**
     * 设置 动画播完后 显示的图片
     * @param f 
     */
    setIdle(f: cc.SpriteFrame) {
        this.idle = f;
    }

    /**
     * Sets sprite frame
     * @param spriteFrame 图片
     */
    setSpriteFrame(spriteFrame: cc.SpriteFrame) {
        this.sprite.spriteFrame = spriteFrame;
    }

    /**
     * 设置帧数组
     * @param frameArray 帧数组
     */
    setFrameArray(frameArray: cc.SpriteFrame[]) {
        this.spriteFrames = [];
        for (let i = 0; i < frameArray.length; i++) {
            this.spriteFrames.push(frameArray[i]);
        }
    }

    /**
     * Gets sprite frame
     * @returns sprite frame 图片
     */
    getSpriteFrame(): cc.SpriteFrame {
        return this.sprite.spriteFrame;
    }

    /**
     * 动画的播放时间
     * @returns duration 
     */

    getDuration(): number {
        return this.playSpeed * this.spriteFrames.length;
    }

    update(dt) {
        if (this.isPlay) {
            this.timeSum += dt;
            if (this.timeSum >= this.playSpeed) {
                this.sprite.spriteFrame = this.spriteFrames[this.nextIndex++];
                this.timeSum = 0;

                if (this.nextIndex >= this.spriteFrames.length) { //一轮播放完毕
                    if (this.isLoop) //要循环播放
                        this.nextIndex = 0;
                    else {
                        this.isPlay = false;

                        //播放完后的处理
                        if (this.idle) //有不播放动画时的图片
                            this.sprite.spriteFrame = this.idle;
                        else if (this.isFirstFrameInEnd)
                            this.sprite.spriteFrame = this.spriteFrames[0]; //复原为第一帧

                        //重置
                        if (this.isInvertedPlay) {
                            this.spriteFrames.reverse();
                            this.isInvertedPlay = false;
                        }

                        if (this.backFunc !== null)
                            this.backFunc();
                        return;
                    }
                }
            }
        }
    }
}
