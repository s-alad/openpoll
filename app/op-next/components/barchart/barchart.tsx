import { BarChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import Poll from '@/models/poll';

interface PollChartProps {
    poll?: Poll;
}

export default function RenderBarChart({ poll }: PollChartProps) {
    const [pollData, setPollData] = useState<{ label: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function extractPollData() {
            if (!poll) return; // Exit early if poll is not available
            
            const options = poll.options;
            const responses = poll.responses;

            if (!responses || !options) return; // Exit early if responses or options are not available

            const currentPollData = options.map((currentOption) => {
                let current_value = 0; // Default value if no one chose the option
                if (responses[currentOption.option]) {
                    current_value = Object.keys(responses[currentOption.option]).length;
                }

                return { 
                    label: currentOption.option, 
                    value: current_value 
                };
            });

            setPollData(currentPollData);
            setLoading(false);
        }

        extractPollData();
    }, [poll]);

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <BarChart 
                        dataset={pollData}
                        yAxis={[{ scaleType: "band", dataKey: "label"}]}
                        series={[{ dataKey: "value", label: "# of Answers"}]}
                        width={500}
                        height={400}
                        layout="horizontal"
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
                </div>
            )}
        </div>
    );
}
