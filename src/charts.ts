const ChartJsNode = require("chartjs-node");

export default class Charts {
    public static createMessages(data: any): Promise<Buffer> {
        const chart = new ChartJsNode(600, 600);

        return new Promise((resolve) => {
            chart.drawChart({
                type: "bar",
    
                data: data,
    
                options: {
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        ]
                    }
                }
            }).then(() => {
                // Get image as PNG buffer after chart is created
                return chart.getImageBuffer("image/png");
            }).then((buffer: Buffer) => {
                resolve(buffer);
            });
        });
    }
}