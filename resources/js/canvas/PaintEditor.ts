import { Canvas, PencilBrush, FabricImage } from 'fabric';

export class PlatformPaintEditor {
    private fabricCanvas: Canvas;
    private vectorLayerMode: boolean = true;

    constructor(htmlElementId: string) {
        this.fabricCanvas = new Canvas(htmlElementId, {
            width: 480,
            height: 360,
            preserveObjectStacking: true
        });
    }

    public enableBitmapBrushMode(brushColor: string = '#000000', brushWidth: number = 4) {
        this.vectorLayerMode = false;
        this.fabricCanvas.isDrawingMode = true;

        // Use PencilBrush for standard pixel-level actions [cite: 27, 29]
        const drawingBrush = new PencilBrush(this.fabricCanvas);
        drawingBrush.color = brushColor;
        drawingBrush.width = brushWidth;
        this.fabricCanvas.freeDrawingBrush = drawingBrush;
    }

    public enableVectorSelectionMode() {
        this.vectorLayerMode = true;
        this.fabricCanvas.isDrawingMode = false;
    }

    public convertDrawingToRasterImage() {
        // Render the vector layer to a rasterized data URL [cite: 30]
        const renderedDataUrl = this.fabricCanvas.toDataURL({
            format: 'png',
            multiplier: 1
        });

        this.fabricCanvas.clear();
        this.enableBitmapBrushMode();

        const imageObj = new Image();
        imageObj.src = renderedDataUrl;
        imageObj.onload = () => {
            const flatLayer = new FabricImage(imageObj, {
                left: 0,
                top: 0,
                selectable: false
            });
            this.fabricCanvas.add(flatLayer);
            this.fabricCanvas.renderAll();
        };
    }

    public exportFinishedCostume(): string {
        return this.vectorLayerMode
            ? this.fabricCanvas.toSVG()
            : this.fabricCanvas.toDataURL({
                format: 'png',
                multiplier: 1
            });
    }
}