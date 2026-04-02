// utils/carList.js
const CAR_LIST = [
    // Porsche Cup
    { tag: 'pcup', name: 'Porsche 911 Cup', category: 'Porsche Cup' },

    // Hypercars
    { tag: 'bmwhy', name: 'BMW M Hybrid V8', category: 'Hypercars' },
    { tag: 'cadihy', name: 'Cadillac GTP Hypercar', category: 'Hypercars' },
    { tag: 'acuhy', name: 'Acura ARX-06 GTP', category: 'Hypercars' },
    { tag: '963hy', name: 'Porsche 963 GTP', category: 'Hypercars' },
    { tag: '499hy', name: 'Ferrari 499P', category: 'Hypercars' },

    // GT3
    { tag: 'bmwgt3', name: 'BMW M4 GT3', category: 'GT3' },
    { tag: 'lambogt3', name: 'Lamborghini Huracán GT3 EVO2', category: 'GT3' },
    { tag: 'mercgt3', name: 'Mercedes-AMG GT3', category: 'GT3' },
    { tag: 'porschegt3', name: 'Porsche 911 GT3 R', category: 'GT3' },
    { tag: 'ferrarigt3', name: 'Ferrari 296 GT3', category: 'GT3' },
    { tag: 'corvgt3', name: 'Corvette Z06 GT3', category: 'GT3' },
    { tag: 'mustgt3', name: 'Ford Mustang GT3', category: 'GT3' },
    { tag: 'mclarengt3', name: 'McLaren 720S GT3', category: 'GT3' },
    { tag: 'acuragt3', name: 'Acura NSX GT3 EVO22', category: 'GT3' },
    { tag: 'astongt3', name: 'Aston Martin Vantage GT3', category: 'GT3' },

    // GT4
    { tag: 'porschegt4', name: 'Porsche 718 Cayman GT4', category: 'GT4' },
    { tag: 'mclarengt4', name: 'McLaren 570S GT4', category: 'GT4' },
    { tag: 'mercedesgt4', name: 'Mercedes-AMG GT4', category: 'GT4' },
    { tag: 'bmwgt4', name: 'BMW M4 GT4', category: 'GT4' },
    { tag: 'fordgt4', name: 'Ford Mustang GT4', category: 'GT4' },
    { tag: 'astongt4', name: 'Aston Martin Vantage GT4', category: 'GT4' },

    // LMP
    { tag: 'lmp2', name: 'ORECA 07 LMP2', category: 'LMP2' },
    { tag: 'lmp3', name: 'Ligier JS P320 LMP3', category: 'LMP3' },

    // Indycar
    { tag: 'indy', name: 'Dallara IR-18 Indycar', category: 'Indycar' },

    // NASCAR
    { tag: 'ncup', name: 'NASCAR Cup Series', category: 'NASCAR' },
    { tag: 'ntrucks', name: 'NASCAR Camping World Truck', category: 'NASCAR Trucks' },
    { tag: 'oriley', name: "O'Reilly Auto Parts 300 (ARCA)", category: "O'Reilly" },

    // Fórmulas
    { tag: 'f1', name: 'Formula 1', category: 'F1' },
    { tag: 'f3', name: 'Dallara F3', category: 'Formula 3' },
    { tag: 'sf23', name: 'Super Formula SF23', category: 'SF23' },
    { tag: 'sfl', name: 'Super Formula Lights', category: 'Super Formula Lights' },

    // Otros
    { tag: 'mx5', name: 'Mazda MX-5 Cup', category: 'Mazda MX-5' },

    // NEC exclusivos
    { tag: 'hyutcr', name: 'Hyundai Elantra N TCR', category: 'NEC' },
    { tag: 'hontcr', name: 'Honda Civic Type R TCR', category: 'NEC' },
    { tag: 'audtcr', name: 'Audi RS3 LMS TCR', category: 'NEC' },
    { tag: 'bmwm2', name: 'BMW M2 CS Racing', category: 'NEC' },
];

module.exports = CAR_LIST;