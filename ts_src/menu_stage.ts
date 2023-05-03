import * as PIXI from 'pixi.js';
import { Stage } from './stage';
import { LoopArea } from './rope';
import { Butterfly } from './butterfly';
import { myConsts, ButterflySizeType } from './const';
import { GameStage } from './game_stage';
import { Message } from './message';
import { Resource } from 'pixi.js';
import { resolve } from 'path';

class MenuButton extends PIXI.Container
{
    selectedFunction:()=>void;
    app:PIXI.Application;
    label:string;

    constructor(text:string, app:PIXI.Application, func:()=>void)
    {
        super();
        this.app = app;
        this.label = text;
        const color = myConsts.COLOR_LIST[1];
        const butterfly = new Butterfly(ButterflySizeType.MEDIUM, color, color, 1, app);
        const textObj = new PIXI.Text(text, {
            fontFamily: 'Amatic SC',
            fontSize: 50,
            
            fontWeight: 'bold',
            fill: ['#432c39'],
            lineJoin: 'round',
            align: 'center',
        });

        textObj.x = 25;
        textObj.anchor.y = 0.5;
        this.addChild(textObj);
        this.addChild(butterfly);

        this.selectedFunction = func;
        this.interactive = true;
        this.on('pointertap', () =>
        {
            console.log(this.getBounds());
            const msg = new Message('Don\'t click. Please loop!', 20);

            msg.x = (app.screen.width / 2);
            msg.y = app.screen.height / 2;
            app.stage.addChild(msg);
            msg.show(true, 50);
        });
        this.visible = false;
    }
    show()
    {
        this.visible = true;
    }
    selected()
    {
        if (!this.visible)
        {
            console.warn('not visible button.');

            return;
        }
        this.selectedFunction();
    }
    isHit(loopArea:LoopArea):boolean
    {
        let res = false;

        for (const point of this.getPoints())
        {
            const hit = this.app.renderer.plugins.interaction.hitTest(point, loopArea);

            if (hit && hit.name === 'loopObj')
            {
                res = true;
                break;
            }
        }

        return res;
    }
    private getPoints():PIXI.Point[]
    {
        const arr: Array<PIXI.Point> = [];
        const xStart = Math.round(this.getBounds().x);
        const xEnd = Math.round(xStart + this.getBounds().width);
        const yStart = Math.round(this.getBounds().y);
        const yEnd =  Math.round(yStart + this.getBounds().height);

        for (let x = xStart; x <= xEnd; x++)
        {
            for (let y = yStart; y <= yEnd; y++)
            {
                arr.push(new PIXI.Point(x, y));
            }
        }

        return arr;
    }
}

class Leaf extends PIXI.Sprite{
    constructor(texture:PIXI.Texture<Resource> | undefined){
        super(texture);
        this.anchor.y = 1;
    }

    async bound(isLeft:boolean){
        let radius = 0;
        const boundCount = 2;

        return new Promise<void>((resolve) =>{
            const baseAngle = this.angle;
            const angleRange = 20;
            const ticker = new PIXI.Ticker();
            let boundedCount = 0;
            ticker.add(()=>{
                radius += 6 * (boundedCount + 1); //speed
                const addAngle = Math.sin(Math.PI/180*radius) * angleRange / (boundedCount+1);
                if(isLeft){
                    this.angle =  baseAngle - addAngle;
                }else{
                    this.angle =  baseAngle + addAngle;
                }
                
                if(radius > 180){
                    boundedCount += 1;
                    radius = 0;
                }
                if (boundCount == boundedCount){
                    ticker.stop();
                    resolve();
                }
            });
            ticker.start();
        });
    }
}



export class MenuStage extends Stage
{
    constructor(app:PIXI.Application, stage1:GameStage)
    {
        super(app);
        this.showLeaves();
        const title = new PIXI.Text('LOOP', {
            fontFamily: 'Amatic SC',
            fontSize: 100,
            fill: ['#fcc5e4', '#fda34b', '#ff7882', '#c8699e', '#7046aa', '#0c1db8', '#020f75'],
            align: 'center',
        });

        title.x = this.app.screen.width / 2;
        title.y = this.app.screen.height / 5;
        title.anchor.set(0.5);

        this.BACKGROUND_CONTAINER.addChild(title);
        const startButton = new MenuButton('start', this.app, async () =>
        {
            // TODO MENUstageのdestroy
            await this.removeMenuStage();
            stage1.initialize();
            stage1.start().then((res) =>
            {
                stage1.dispResult(res);
                console.log(`stage1.done:result=${res}`);
            });
        });

        startButton.x = (app.screen.width / 3) - (startButton.getBounds().width / 2);
        startButton.y = app.screen.height * 2 / 5;
        this.GAME_CONTAINER.addChild(startButton);

        const helpButton = new MenuButton('help', this.app, () =>
        {
            // TODO help
            console.log('help');
            const msg = new Message('sorry,in preparation', 20);

            msg.x = (app.screen.width / 2);
            msg.y = app.screen.height / 2;
            app.stage.addChild(msg);
            msg.show(true, 50);
        });

        helpButton.x = (app.screen.width * 2 / 3) - (helpButton.getBounds().width / 2);
        helpButton.y = app.screen.height * 2 / 5;
        this.GAME_CONTAINER.addChild(helpButton);

        // TODO button and setBackGroundのasync化
        startButton.show();
        helpButton.show();
    }
    initialize(): void
    {
        super.initialize();
        this.setRope(50);
    }
    private async showLeaves()
    {
        const leaf1 = new Leaf(this.app.loader.resources.leaf1.texture);
        leaf1.y = this.app.screen.height * 1.1;

        const leaf2 = new Leaf(this.app.loader.resources.leaf2.texture);
        leaf2.x = this.app.screen.width * 1 / 8;
        leaf2.y = this.app.screen.height * 1.1;

        const leaf3 = new Leaf(this.app.loader.resources.leaf3.texture);
        leaf3.x = this.app.screen.width * 2 / 8;
        leaf3.y = this.app.screen.height * 1.1;

        const leaf4 = new Leaf(this.app.loader.resources.leaf4.texture);
        leaf4.x = this.app.screen.width * 3 / 8;
        leaf4.y = this.app.screen.height * 1.05;

        const leaf5 = new Leaf(this.app.loader.resources.leaf5.texture);
        leaf5.x = this.app.screen.width * 4 / 8;
        leaf5.y = this.app.screen.height * 1.05;

        const leaf6 = new Leaf(this.app.loader.resources.leaf6.texture);
        leaf6.x = this.app.screen.width * 5 / 8;
        leaf6.y = this.app.screen.height * 1.05;

        const leaf7 = new Leaf(this.app.loader.resources.leaf7.texture);
        leaf7.x = this.app.screen.width * 6 / 8;
        leaf7.y = this.app.screen.height * 1.1;

        this.BACKGROUND_CONTAINER.addChild(leaf1);
        this.BACKGROUND_CONTAINER.addChild(leaf7);
        this.BACKGROUND_CONTAINER.addChild(leaf2);
        this.BACKGROUND_CONTAINER.addChild(leaf6);
        this.BACKGROUND_CONTAINER.addChild(leaf3);
        this.BACKGROUND_CONTAINER.addChild(leaf5);
        this.BACKGROUND_CONTAINER.addChild(leaf4);

        await Promise.all([
            setTimeout(() => {leaf1.bound(true) }, 100),
            setTimeout(() => { leaf2.bound(false) }, 300),
            setTimeout(() => { leaf3.bound(true) }, 200),
            setTimeout(() => { leaf4.bound(false) }, 500),
            setTimeout(() => { leaf5.bound(false) }, 400),
            setTimeout(() => { leaf6.bound(true) }, 100),
            setTimeout(() => { leaf7.bound(false) }, 200),
        ]);

    }

    private async removeMenuStage(){
        return new Promise<boolean>(async (resolve) =>{
            this.BACKGROUND_CONTAINER.removeChildren();
            this.GAME_CONTAINER.removeChildren();
            setTimeout(() => { resolve(false); }, 1000);
        });
    }

    protected loop(points: number[]): void
    {
        this.deleteRoop();
        const loopArea = new LoopArea(points);

        const buttons = this.GAME_CONTAINER.children;
        const loopedButtons: Array<MenuButton> = [];

        for (const button of buttons)
        {
            if (!(button instanceof MenuButton))
            {
                continue;
            }
            if (button.isHit(loopArea))
            {
                loopedButtons.push(button);
            }
        }
        if (loopedButtons.length === 1)
        {
            loopedButtons[0].selected();
        }
        this.GAME_CONTAINER.addChild(loopArea);
        loopArea.delete();
    }
}

