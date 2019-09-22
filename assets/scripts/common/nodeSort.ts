const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeSort extends cc.Component {

    private children: cc.Node[];
    private cT: number = 0;
    private cL: number = 1;
    onLoad() {
        this.children = this.node.children;
    }

    start() {

    }

    update(dt) {
        if (this.children === undefined)
            return;
        this.cT += dt;
        if (this.cT >= this.cL) {
            this.cT = 0;

            this.children.sort(function (a: cc.Node, b: cc.Node): number {
                if (a.y > b.y)
                    return -1;
                else
                    return 1;
            });
            for (let i = 0; i < this.children.length; i++)
                this.children[i].zIndex = 1000 + i;
        }
    }
}
