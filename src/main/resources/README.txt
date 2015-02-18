flexstore_O.html : will load plain flexstore WITHOUT logger 
                   and WITHOUT any instrumentation.
                   
flexstore_A.html  : flexstore with logger, NO deep instrumentation,
                    NO coverage instrumentation

flexstore_C.html : flexstore with NO logger, NO deep instrumentation,
                    WITH coverage instrumentation  
                    
flexstore_AC.html : flexstore with logger, NO deep instrumentation,
                    WITH coverage instrumentation                    
                    
flexstore_D.html : flexstore with logger, WITH deep instrumentation,
                   NO coverage instrumentation                     
                   
Deep instrumentation and coverage instrumentation are not compatible
with each other.