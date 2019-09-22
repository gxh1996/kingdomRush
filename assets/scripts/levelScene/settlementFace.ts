import StarReview from "../common/starReview";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettlementFace extends cc.Component {

    @property({ type: cc.Node })
    private failFace: cc.Node = null;

    @property({ type: cc.Node })
    private passFace: cc.Node = null;

    @property({ type: StarReview })
    private starReview: StarReview = null;

    start() {

    }

    outFailFace() {
        this.outFace(this.failFace);
    }
    private hiddenFailFace() {
        this.hiddenFace(this.failFace);
    }

    outPassFace(g: number) {
        this.starReview.setReview(g);
        this.outFace(this.passFace);
    }
    private hiddenPassFace() {
        this.hiddenFace(this.passFace);
    }

    hiddenSettleFace() {
        if (this.failFace.active)
            this.hiddenFailFace();
        if (this.passFace.active)
            this.hiddenPassFace();

    }

    private outFace(node: cc.Node) {
        node.active = true;
        node.runAction(cc.fadeIn(0.2));
        this.scheduleOnce(function () {
            cc.director.pause();
        }, 0.2)
    }

    private hiddenFace(node: cc.Node) {
        cc.director.resume();
        node.runAction(cc.fadeOut(0.2))
        this.scheduleOnce(function () {
            node.active = false;
        }.bind(this), 0.2);
    }

}
