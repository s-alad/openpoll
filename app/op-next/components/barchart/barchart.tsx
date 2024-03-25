import { BarChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';

interface LivePoll {
    active: boolean;
    options: {
        option: string;
        letter: string;
    }[];
    question: string;
    responses?: {
        [studentid: string]: string;
    };
}

type DatasetElementType = {
    [key: string]: string | number | Date | null | undefined;
};

interface PollChartProps {
    livepoll?: LivePoll;
}

export default function PollChart({ livepoll }: PollChartProps) {
    const [data, setData] = useState<DatasetElementType[]>([]);
    console.log(livepoll, "livepoll")
    console.log(livepoll?.options, "livepoll?.options")

    useEffect(() => {
        if (livepoll?.options) {
          console.log('Effect triggered with livepoll:', livepoll);
          const newData = livepoll.options.map(option => {
            const responseCount = livepoll.responses?.[option.letter]
              ? Object.keys(livepoll.responses[option.letter]).length
              : 0;
            return {
              option: option.letter, 
              responses: responseCount, 
            } as unknown as DatasetElementType; // Cast each object to the expected type
          });
    
          setData(newData as DatasetElementType[]); // Cast the entire array to the expected type
        }
      }, [livepoll]); // Update the data whenever livepoll changes

    return (
        <div>
            {livepoll && data.length > 0 && (
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
                    // Style the bars dynamically based on their index
                    "& .MuiBarElement-root": {
                        "&:nth-of-type(1)": { fill: "#FBB91B" },
                        "&:nth-of-type(2)": { fill: "#FE6768" },
                        "&:nth-of-type(3)": { fill: "#9596FF" },
                        "&:nth-of-type(4)": { fill: "blue" },
                        "&:nth-of-type(5)": { fill: "purple" },
                    },
                    // Change left yAxis label styles
                    "& .MuiChartsAxis-tickLabel": {
                        strokeWidth: "0.4",
                        fontSize: "20px",
                        fontWeight: "bold",
                        fontFamily: "'Open Sans', sans-serif",
                    },
                }}
            />
            )}
        </div>
    );
}
