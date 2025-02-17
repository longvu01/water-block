import { useEffect, useRef, useState } from "react";

const BLOCK_SIZE = 30;
const DEFAULT_MAX_BLOCK_HEIGHT = 7;

export default function App() {
  const [sumWater, setSumWater] = useState<number | null>(null);
  const [blockHeights, setBlockHeights] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChangeBlocksHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const inputValue = event.target.value.trim()

    if (!/^(?:[0-9]+,)*[0-9]*$/.test(inputValue) && inputValue !== "") {
      setBlockHeights([])
      setError("Please enter a valid input. Example: 3,0,2,0,4");
      return; 
    }

    const blocks = inputValue.split(",").map(b => +b.trim()).filter(n => !isNaN(n) && n >= 0);
    setBlockHeights(blocks);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const blockAmount = blockHeights.length
    const maxHeight = Math.max(...blockHeights, DEFAULT_MAX_BLOCK_HEIGHT);

    const leftMax = new Array(blockAmount).fill(0);
    const rightMax = new Array(blockAmount).fill(0);
    let calcSumWater = 0

    leftMax[0] = blockHeights[0];
    // Fill leftMax arr
    for (let i = 1; i < blockAmount; i++) {
      leftMax[i] = Math.max(leftMax[i - 1], blockHeights[i]);
    }

    rightMax[blockAmount - 1] = blockHeights[blockAmount - 1];
    // Fill rightMax arr
    for (let i = blockAmount - 2; i >= 0; i--)  {
      rightMax[i] = Math.max(rightMax[i + 1], blockHeights[i]);
    }
    blockHeights.forEach((blockHeight, blockHeightIdx) => {
      // Draw wall block
      for (let i = 0; i < blockHeight; i++) {
        ctx.strokeStyle = "black";

        const xRect = blockHeightIdx * BLOCK_SIZE
        const yRect = (maxHeight - i) * BLOCK_SIZE

        ctx.strokeRect(xRect, yRect, BLOCK_SIZE, BLOCK_SIZE);
        
        if(i === 0) {
          ctx.fillText(blockHeightIdx.toString(), blockHeightIdx * BLOCK_SIZE + BLOCK_SIZE / 2, yRect + BLOCK_SIZE * 2);
        }
      }

      // Draw water block
      const waterLevel = Math.min(leftMax[blockHeightIdx], rightMax[blockHeightIdx]);
      if (waterLevel > blockHeight) {
        for (let i = blockHeight; i < waterLevel; i++) {
          ctx.fillStyle = "blue";
          ctx.fillRect(blockHeightIdx * BLOCK_SIZE, (maxHeight - i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }

      calcSumWater += Math.max(0, waterLevel - blockHeight);
    });

    setSumWater(calcSumWater);
  }, [blockHeights]);

  return (
    <>
      <div style={{display:'flex', gap: '16px'}}>
        <input type="text" onChange={handleChangeBlocksHeight} placeholder="Enter here" />
        <div>Sum of water: {sumWater !== null && sumWater}</div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <br />
      <canvas ref={canvasRef} width={600} height={300} style={{ border: "1px solid #000" }}>
        Water block
      </canvas>
    </>
  );
}
