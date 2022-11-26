import * as PIXI from 'pixi.js';

class LineSegment
{
    p1:PIXI.Point;
    p2:PIXI.Point;

    constructor(x1:number, y1:number, x2:number, y2:number)
    {
        this.p1 = new PIXI.Point(x1, y1);
        this.p2 = new PIXI.Point(x2, y2);
    }

    isCross(line:LineSegment):boolean
    {
        let s = ((this.p1.x - this.p2.x) * (line.p1.y - this.p1.y)) - ((this.p1.y - this.p2.y) * (line.p1.x - this.p1.x));
        let t = ((this.p1.x - this.p2.x) * (line.p2.y - this.p1.y)) - ((this.p1.y - this.p2.y) * (line.p2.x - this.p1.x));

        if (s * t > 0)
        {
            return false;
        }
        s = ((line.p1.x - line.p2.x) * (this.p1.y - line.p1.y)) - ((line.p1.y - line.p2.y) * (this.p1.x - line.p1.x));
        t = ((line.p1.x - line.p2.x) * (this.p2.y - line.p1.y)) - ((line.p1.y - line.p2.y) * (this.p2.x - line.p1.x));
        if (s * t > 0)
        {
            return false;
        }

        return true;
    }
}

export class Rope extends PIXI.Graphics
{
    x1:number; y1:number; x2:number; y2:number;
    lineLength:number;
    lineSegment:LineSegment;
    radian:number;
    constructor(x1:number, y1:number, x2:number, y2:number)
    {
        super();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.lineSegment = new LineSegment(x1, y1, x2, y2);

        const width = 10;

        this.lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        this.radian = Math.atan2(x2 - x1, y2 - y1);

        const rect = new PIXI.Rectangle(0 - (width / 2), 0, width, this.lineLength);

        this.beginFill(0xffffff, 1);
        this.drawShape(rect);
        this.alpha = 0.5;
        this.endFill();

        this.lineStyle(2, 0x000000)
            .moveTo(0, 0)
            .lineTo(0, this.lineLength);

        this.position.x = x1;
        this.position.y = y1;
        this.pivot.set(0, 0);
        this.rotation -= this.radian;
        this.hitArea = rect;
    }
}

export class LoopArea extends PIXI.Graphics
{
    private ticker: PIXI.Ticker;
    constructor(points:number[])
    {
        super();
        const poly = new PIXI.Polygon(points);

        this.buttonMode = true;
        this.hitArea = poly;
        this.beginFill(0xffffff, 0.5);
        this.drawShape(poly);
        this.name = 'loopObj';
        this.ticker = new PIXI.Ticker();
        this.ticker.start();
        this.interactive = true;
        this.cursor = 'url(../images/pencil.png) 0 18,auto';
    }

    delete(func?:()=>void)
    {
        let frame = 0;

        this.ticker.add(() =>
        {
            frame += 1;
            if (frame <= 10)
            {
                return;
            }
            this.alpha -= 0.03;
            if (this.alpha <= 0.1)
            {
                this.ticker.destroy();
                this.destroy();
                if (func !== null && func !== undefined)
                {
                    func();
                }
            }
        });
    }
}
