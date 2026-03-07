import sys
import traceback
sys.stdout.reconfigure(encoding='utf-8')

try:
    from app.services.rag_chain import SajuRAGChain
    print("SajuRAGChain imported successfully.")
    
    chain = SajuRAGChain()
    matrix = {
        'time_pillar': {'heavenly':{'label':'갑'},'earthly':{'label':'자'}},
        'day_pillar': {'heavenly':{'label':'을'},'earthly':{'label':'축'}},
        'month_pillar': {'heavenly':{'label':'병'},'earthly':{'label':'인'}},
        'year_pillar': {'heavenly':{'label':'정'},'earthly':{'label':'묘'}}
    }
    
    print("Running generate_specific_reading...")
    res = chain.generate_specific_reading(matrix, "신년운세")
    print("Result:", res[:100])
    
    print("ALL SUCCESS!")
except Exception as e:
    print("ERROR CAUGHT:")
    traceback.print_exc()
