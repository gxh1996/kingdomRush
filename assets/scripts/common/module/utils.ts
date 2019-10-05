export default class Utils {


    /**
     * Gets random number
     * @param min 
     * @param max 
     * @returns [min, max]: Interger 
     */
    static getRandomInterger(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    static remvoeItemOfArray(array: any[], item: any) {
        let i: number = array.indexOf(item);
        array.splice(i, 1);
    }

    /**
     * 2点间的距离，注意同一节点坐标
     */
    static getDisOfTwoPos(p1: cc.Vec2, p2: cc.Vec2): number {
        let l: number = p1.sub(p2).mag();
        return l;
    }

}