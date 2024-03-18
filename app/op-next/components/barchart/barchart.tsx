import { BarChart } from '@mui/x-charts';

type DatasetElementType = {
    [key: string]: string | number | Date | null | undefined;
}; // MUI X Charts expects this type for the dataset

interface PollChartProps {
    data: DatasetElementType[];
}

export default function PollChart({ data }: PollChartProps) {
    return (
        <div>
            <BarChart
                dataset={data}
                yAxis={[{ scaleType: 'band', dataKey: 'option' }]}
                series={[
                    {
                        dataKey: "responses",
                    },
                ]}
                layout="horizontal"
                width={800}
                height={300}
                bottomAxis={null}
                sx={{
                    "& .MuiBarElement-root:nth-child(1)": {
                        fill: "#FBB91B", // Style the first bar
                    },
                    "& .MuiBarElement-root:nth-child(2)": {
                        fill: "#FE6768", // Style the second bar
                    },
                    "& .MuiBarElement-root:nth-child(3)": {
                        fill: "#9596FF", //
                    },
                    "& .MuiBarElement-root:nth-child(4)": {
                        fill: "blue", // 
                    },
                    "& .MuiBarElement-root:nth-child(5)": {
                        fill: "purple",
                    },
                    //change left yAxis label styles
                    "& .MuiChartsAxis-tickLabel":{
                        strokeWidth:"0.4",
                        fontSize: "20px !important",
                        fontWeight: "bold",
                        fontFamily: "Open Sans, sans-serif",
                    },
                }}
            />
        </div>
    );
}
