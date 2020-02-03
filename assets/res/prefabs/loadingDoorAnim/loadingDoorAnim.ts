import SoundsManager from "../../../scripts/common/module/soundsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingDoorAnim extends cc.Component {

    @property({
        displayName: "开关门时间"
    })
    time: number = 1;

    private lDoor: cc.Node = null;
    private rDoor: cc.Node = null;
    /**
     * 门是开的吗
     */
    isDoorOpen: boolean = true;
    private viewSize: cc.Size = null;
    onLoad() {
        this.lDoor = this.node.getChildByName("lDoor");
        this.rDoor = this.node.getChildByName("rDoor");
        this.viewSize = cc.view.getVisibleSize();

        this.setState(true)
    }

    start() {
    }

    /**
     * 设置门的状态
     * @param state true为开 
     */
    setState(state: boolean) {
        if (state) {
            this.lDoor.setPosition(cc.v2(-this.viewSize.width, 0));
            this.rDoor.setPosition(cc.v2(this.viewSize.width, 0));
            this.isDoorOpen = true;
        }
        else {
            this.lDoor.setPosition(cc.v2(2, 0))
            this.rDoor.setPosition(cc.v2(-2, 0))
            this.isDoorOpen = false;
        }
    }

    /**
     * 开门动画
     */
    openDoor() {
        if (this.isDoorOpen)
            return;

        let d: cc.ActionInterval = cc.delayTime(1);
        let func: cc.ActionInstant = cc.callFunc(function () {
            let la: cc.ActionInterval = cc.moveTo(this.time, cc.v2(-this.viewSize.width, 0)).easing(cc.easeIn(2));
            let ra: cc.ActionInterval = cc.moveTo(this.time, cc.v2(this.viewSize.width, 0)).easing(cc.easeIn(2));
            this.lDoor.runAction(la);
            this.rDoor.runAction(ra);
        }.bind(this));
        let seq: cc.ActionInterval = cc.sequence(d, func);
        this.node.runAction(seq);

        this.isDoorOpen = true;
    }

    /**
     * 关门动画
     * @param func 回调函数
     */
    closeDoor(func: cc.ActionInstant) {
        if (!this.isDoorOpen)
            return;

        let la: cc.ActionInterval = cc.moveTo(this.time, cc.v2(2, 0)).easing(cc.easeIn(2));
        let ra: cc.ActionInterval = cc.moveTo(this.time, cc.v2(-2, 0)).easing(cc.easeIn(2));
        let f1: cc.ActionInstant = cc.callFunc(function () {
            SoundsManager.ins.playEffect("sounds/close_door");
        }, this);

        let seq: cc.ActionInterval = cc.sequence(ra, f1, func);
        this.lDoor.runAction(la);
        this.rDoor.runAction(seq);

        this.isDoorOpen = false;
    }

}
