from .kye import KyeAgent
from .waltz import WaltzAgent
from .carl import CarlAgent
from .dsouza import DSouzaAgent
from .mary import MaryAgent
from .kara import KaraAgent
from .vince import VinceAgent
from .rina import RinaAgent
from .eliot import EliotAgent
from .menon import MenonAgent

# The Midnight Curator Agents
from .moretti import MorettiAgent
from .marcus import MarcusAgent
from .isabelle import IsabelleAgent
from .kask import KaskAgent
from .sophie import SophieAgent
from .victor import VictorAgent
from .thomas import ThomasAgent
from .diane import DianeAgent

# Instantiate singletons for Daisy & Fibonacci
_kye = KyeAgent()
_waltz = WaltzAgent()
_carl = CarlAgent()
_dsouza = DSouzaAgent()
_mary = MaryAgent()
_kara = KaraAgent()
_vince = VinceAgent()
_rina = RinaAgent()
_eliot = EliotAgent()
_menon = MenonAgent()

# Instantiate singletons for The Midnight Curator
_moretti = MorettiAgent()
_marcus = MarcusAgent()
_isabelle = IsabelleAgent()
_kask = KaskAgent()
_sophie = SophieAgent()
_victor = VictorAgent()
_thomas = ThomasAgent()
_diane = DianeAgent()

# Comprehensive registry supporting all ID aliases
AGENTS_REGISTRY = {
    # Daisy & Fibonacci characters
    "kye": _kye,
    "kye_harlan": _kye,
    "waltz": _waltz,
    "professor_aldous_waltz": _waltz,
    "carl": _carl,
    "carl_dsouza": _carl,
    "dsouza": _dsouza,
    "arthur_dsouza": _dsouza,
    "mary": _mary,
    "kara": _kara,
    "kara_voss": _kara,
    "vince_okafor": _vince,
    "vince": _vince,
    "rina_soares": _rina,
    "rina": _rina,
    "eliot_dsouza": _eliot,
    "eliot": _eliot,
    "dr_menon": _menon,
    "dr_priya_menon": _menon,

    # The Midnight Curator characters
    "father_moretti": _moretti,
    "moretti": _moretti,
    "antonio_moretti": _moretti,

    "marcus_chen": _marcus,
    "marcus": _marcus,

    "isabelle_rousseau": _isabelle,
    "isabelle": _isabelle,
    "isabelle_laurent": _isabelle,

    "dr_raymond_kask": _kask,
    "kask": _kask,
    "raymond_kask": _kask,
    "viktor_kask": _kask,

    "sophie_lin": _sophie,
    "sophie": _sophie,
    "sophie_delacroix": _sophie,

    "victor_voss": _victor,
    "victor": _victor,

    "thomas_wade": _thomas,
    "thomas": _thomas,

    "diane_park": _diane,
    "diane": _diane,
}

def get_agent(agent_name):
    if not agent_name:
        return None
    key = str(agent_name).lower().strip().replace("-", "_")
    return AGENTS_REGISTRY.get(key)

def list_all_agents():
    return list(AGENTS_REGISTRY.keys())
