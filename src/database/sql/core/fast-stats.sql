-- selectMinStableHeight
SELECT MIN(height) AS min_height
FROM stable_blocks

-- selectMaxStableHeight
SELECT MAX(height) AS max_height
FROM stable_blocks

-- selectMinNewHeight
SELECT MIN(height) AS min_height
FROM new_block_heights

-- selectMaxNewHeight
SELECT MAX(height) AS max_height
FROM new_block_heights