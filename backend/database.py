from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Cargar variables de entorno antes de usarlas
load_dotenv()

# Usar POSTGRES_URL del entorno directamente
SQLALCHEMY_DATABASE_URL = os.getenv("POSTGRES_URL")

if not SQLALCHEMY_DATABASE_URL:
    import sys
    print("=" * 80, file=sys.stderr)
    print("ERROR: POSTGRES_URL no está configurada", file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    print("Para desarrollo local:", file=sys.stderr)
    print("  1. Crea un archivo .env en la carpeta backend/", file=sys.stderr)
    print("  2. Agrega: POSTGRES_URL=tu_url_de_neon", file=sys.stderr)
    print("", file=sys.stderr)
    print("Para producción en Render:", file=sys.stderr)
    print("  1. Ve a tu dashboard de Render", file=sys.stderr)
    print("  2. Selecciona tu servicio", file=sys.stderr)
    print("  3. Ve a 'Environment' en el menú lateral", file=sys.stderr)
    print("  4. Agrega la variable: POSTGRES_URL", file=sys.stderr)
    print("  5. Pega tu URL de Neon (debe empezar con postgresql://)", file=sys.stderr)
    print("  6. Guarda y redespliega el servicio", file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    raise ValueError(
        "POSTGRES_URL no está configurada. "
        "Por favor, configura esta variable de entorno en Render o en tu archivo .env"
    )

engine = create_engine(SQLALCHEMY_DATABASE_URL, 
                        pool_pre_ping=True, 
                        pool_recycle=3600,
                        connect_args={
                            "keepalives": 1,
                            "keepalives_idle": 30,
                            "keepalives_interval": 10,
                            "keepalives_count": 5,
                        })

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    
    finally:
        db.close()