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

from .moretti import MorettiAgent
from .marcus import MarcusAgent
from .isabelle import IsabelleAgent
from .kask import KaskAgent
from .sophie import SophieAgent

# Instantiate singletons
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

_moretti = MorettiAgent()
_marcus = MarcusAgent()
_isabelle = IsabelleAgent()
_kask = KaskAgent()
_sophie = SophieAgent()

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
    "marcus_chen": _marcus,
    "marcus": _marcus,
    "isabelle_laurent": _isabelle,
    "isabelle_rousseau": _isabelle,
    "isabelle": _isabelle,
    "kask": _kask,
    "dr_raymond_kask": _kask,
    "sophie_delacroix": _sophie,
    "sophie_lin": _sophie,
    "sophie": _sophie,
}

def get_agent(agent_name):
    if not agent_name:
        return None
    key = str(agent_name).lower().strip()
    return AGENTS_REGISTRY.get(key)

def list_all_agents():
    return list(AGENTS_REGISTRY.keys())
