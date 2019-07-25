const { ccclass, property } = cc._decorator;

@ccclass
export default class FrameAnimation extends cc.Component {

    @property({
        displayName: "播放速度",
        tooltip: "每秒显示多少张"
    })
    private playSpeed: number = 30;

    @property({
        type: [cc.SpriteFrame],
        tooltip: "帧图片"
    })
    private spriteFrames: cc.SpriteFrame[] = [];

    @property({})
    private playOnLoad: boolean = false;

    private sprite: cc.Sprite = null;
    /**
     * 隔多久显示一张图片
     */
    private time: number = 0;
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
    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
        this.time = 1 / this.playSpeed;
    }

    start() {
        if (this.playOnLoad)
            this.play(true);
    }

    /**
     * 播放帧动画
     * @param isLoop 是否循环播放，默认不循环
     * @param backFunc 动画播放完后将执行该函数
     */
    play(isLoop?: boolean, backFunc: Function = null) {
        this.isLoop = isLoop;
        this.backFunc = backFunc;
        this.nextIndex = 0;
        this.timeSum = 0;

        this.setSpriteFrame(this.spriteFrames[this.nextIndex++]);
        this.isPlay = true;
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

    update(dt) {
        if (this.isPlay) {
            this.timeSum += dt;
            if (this.timeSum >= this.time) {
                this.sprite.spriteFrame = this.spriteFrames[this.nextIndex++];
                this.timeSum = 0;

                if (this.nextIndex >= this.spriteFrames.length) { //一轮播放完毕
                    if (this.isLoop) //要循环播放
                        this.nextIndex = 0;
                    else {
                        this.sprite.spriteFrame = this.spriteFrames[0]; //复原为第一帧
                        if (this.backFunc !== null) {
                            this.backFunc();
                            this.backFunc = null;
                        }
                        this.isPlay = false;
                        return;
                    }
                }
            }
        }
    }
}
