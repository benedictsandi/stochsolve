// =========================================
// NAVIGASI
// =========================================

function bukaFitur(id) {

    document.getElementById("beranda").style.display = "none";

    const semuaFitur =
        document.querySelectorAll(".fitur");

    semuaFitur.forEach(function(fitur) {
        fitur.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function kembali() {

    const semuaFitur =
        document.querySelectorAll(".fitur");

    semuaFitur.forEach(function(fitur) {
        fitur.style.display = "none";
    });

    document.getElementById("beranda").style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}



// =========================================
// FUNGSI UMUM
// =========================================

function kaliVektorMatriks(v, M) {

    const hasil =
        new Array(M[0].length).fill(0);

    for (let j = 0; j < M[0].length; j++) {

        for (let i = 0; i < v.length; i++) {

            hasil[j] += v[i] * M[i][j];

        }

    }

    return hasil;
}


function faktorial(n) {

    let hasil = 1;

    for (let i = 2; i <= n; i++) {
        hasil *= i;
    }

    return hasil;
}


function formatAngka(nilai, digit = 6) {

    return Number(nilai).toFixed(digit);

}



// =========================================
// CHART OBJECT
// =========================================

let chartBelumObj = null;
let chartSimulasiObj = null;
let chartPiObj = null;
let chartMarkov2Obj = null;



// =========================================
// SOAL 1
// MARKOV 3 STATE
// =========================================

function hitungMarkov3() {

    const maxN =
        Number(document.getElementById("nMarkov3").value);

    const jumlahSimulasi =
        Number(
            document.getElementById(
                "simulasiMarkov3"
            ).value
        );


    if (
        !Number.isInteger(maxN) ||
        maxN < 1 ||
        !Number.isInteger(jumlahSimulasi) ||
        jumlahSimulasi < 1
    ) {

        alert("Masukkan jumlah langkah yang valid.");

        return;
    }


    const P = [
        [0.3, 0.7, 0.0],
        [0.1, 0.4, 0.5],
        [1.0, 0.0, 0.0]
    ];


    // =====================================
    // DISTRIBUSI INVARIAN
    // =====================================

    let pi = [1 / 3, 1 / 3, 1 / 3];

    for (let i = 0; i < 10000; i++) {

        const berikut =
            kaliVektorMatriks(pi, P);

        const selisih =
            Math.max(
                ...berikut.map(
                    (nilai, index) =>
                        Math.abs(nilai - pi[index])
                )
            );

        pi = berikut;

        if (selisih < 1e-14) {
            break;
        }
    }


    // =====================================
    // HITTING TIME
    // =====================================

    // Q = state transient 0 dan 1

    const a = 0.7;
    const b = -0.7;
    const c = -0.1;
    const d = 0.6;

    const determinant =
        a * d - b * c;

    const h0 =
        (d - b) / determinant;

    const h1 =
        (a - c) / determinant;


    document.getElementById(
        "hasilInvariant3"
    ).textContent =
        `(${formatAngka(pi[0], 4)}, ` +
        `${formatAngka(pi[1], 4)}, ` +
        `${formatAngka(pi[2], 4)})`;


    document.getElementById(
        "hasilHitting3"
    ).textContent =
        `${formatAngka(h0, 4)} langkah`;


    document.getElementById(
        "langkahMarkov3"
    ).innerHTML = `

        <p>
            Distribusi invarian memenuhi:
            <strong>πP = π</strong>
        </p>

        <p>
            Hasil:
        </p>

        <p>
            π ≈
            (${formatAngka(pi[0], 4)},
            ${formatAngka(pi[1], 4)},
            ${formatAngka(pi[2], 4)})
        </p>

        <br>

        <p>
            Untuk hitting time:
        </p>

        <p>
            h₀ = 1 + 0.3h₀ + 0.7h₁
        </p>

        <p>
            h₁ = 1 + 0.1h₀ + 0.4h₁
        </p>

        <p>
            h₂ = 0
        </p>

        <p>
            Diperoleh:
            <strong>
                h₀ = ${formatAngka(h0, 4)}
            </strong>
            langkah
        </p>

        <p>
            dan
            h₁ = ${formatAngka(h1, 4)}
            langkah.
        </p>
    `;


    // =====================================
    // GRAFIK BELUM MENCAPAI STATE 2
    // =====================================

    const Q = [
        [0.3, 0.7],
        [0.1, 0.4]
    ];

    let alpha = [1, 0];

    const labelsBelum = [];
    const dataBelum = [];


    for (let n = 0; n <= maxN; n++) {

        labelsBelum.push(n);

        dataBelum.push(
            alpha[0] + alpha[1]
        );

        alpha =
            kaliVektorMatriks(alpha, Q);

    }


    if (chartBelumObj) {
        chartBelumObj.destroy();
    }


    chartBelumObj =
        new Chart(
            document.getElementById(
                "chartBelum"
            ),
            {
                type: "line",

                data: {

                    labels: labelsBelum,

                    datasets: [
                        {
                            label:
                                "P(T₂ > n)",

                            data:
                                dataBelum,

                            tension: 0.2
                        }
                    ]
                },

                options: {

                    responsive: true,

                    scales: {

                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            }
        );


    // =====================================
    // SIMULASI MARKOV
    // =====================================

    let state = 0;

    const counts = [1, 0, 0];

    const labelSim = [0];

    const data0 = [1];
    const data1 = [0];
    const data2 = [0];


    for (
        let n = 1;
        n <= jumlahSimulasi;
        n++
    ) {

        const r = Math.random();

        let akumulasi = 0;

        let stateBaru = 0;


        for (
            let j = 0;
            j < P[state].length;
            j++
        ) {

            akumulasi += P[state][j];

            if (r <= akumulasi) {

                stateBaru = j;

                break;
            }
        }


        state = stateBaru;

        counts[state]++;


        labelSim.push(n);

        data0.push(
            counts[0] / (n + 1)
        );

        data1.push(
            counts[1] / (n + 1)
        );

        data2.push(
            counts[2] / (n + 1)
        );

    }


    if (chartSimulasiObj) {
        chartSimulasiObj.destroy();
    }


    chartSimulasiObj =
        new Chart(
            document.getElementById(
                "chartSimulasi"
            ),
            {
                type: "line",

                data: {

                    labels:
                        labelSim,

                    datasets: [

                        {
                            label:
                                "State 0",

                            data:
                                data0,

                            pointRadius: 0
                        },

                        {
                            label:
                                "State 1",

                            data:
                                data1,

                            pointRadius: 0
                        },

                        {
                            label:
                                "State 2",

                            data:
                                data2,

                            pointRadius: 0
                        }

                    ]
                },

                options: {

                    responsive: true,

                    interaction: {
                        intersect: false
                    }
                }
            }
        );


    // =====================================
    // π_n
    // =====================================

    let piN = [1, 0, 0];

    const labelsPi = [];

    const pi0Data = [];
    const pi1Data = [];
    const pi2Data = [];


    for (let n = 0; n <= maxN; n++) {

        labelsPi.push(n);

        pi0Data.push(piN[0]);
        pi1Data.push(piN[1]);
        pi2Data.push(piN[2]);

        piN =
            kaliVektorMatriks(piN, P);
    }


    if (chartPiObj) {
        chartPiObj.destroy();
    }


    chartPiObj =
        new Chart(
            document.getElementById(
                "chartPi"
            ),
            {
                type: "line",

                data: {

                    labels:
                        labelsPi,

                    datasets: [

                        {
                            label:
                                "πn State 0",

                            data:
                                pi0Data
                        },

                        {
                            label:
                                "πn State 1",

                            data:
                                pi1Data
                        },

                        {
                            label:
                                "πn State 2",

                            data:
                                pi2Data
                        }

                    ]
                },

                options: {

                    responsive: true,

                    scales: {

                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            }
        );


    document.getElementById(
        "hasilMarkov3"
    ).style.display = "block";

}



// =========================================
// SOAL 2
// RANDOM SUM POISSON
// =========================================

function hitungRandomSum() {

    const EN =
        Number(
            document.getElementById(
                "enRandom"
            ).value
        );


    const EX =
        Number(
            document.getElementById(
                "exRandom"
            ).value
        );


    const VarX =
        Number(
            document.getElementById(
                "varxRandom"
            ).value
        );


    if (
        EN < 0 ||
        EX < 0 ||
        VarX < 0
    ) {

        alert(
            "Parameter tidak boleh bernilai negatif."
        );

        return;
    }


    // Karena N ~ Poisson
    // Var(N) = E[N]

    const VarN = EN;


    const ES =
        EN * EX;


    const VarS =
        EN * VarX +
        VarN * Math.pow(EX, 2);


    document.getElementById(
        "hasilES"
    ).textContent =
        formatAngka(ES, 4);


    document.getElementById(
        "hasilVarS"
    ).textContent =
        formatAngka(VarS, 4);


    document.getElementById(
        "langkahRandomSum"
    ).innerHTML = `

        <p>
            Karena N mengikuti distribusi Poisson:
        </p>

        <p>
            Var(N) = E[N] = ${EN}
        </p>

        <br>

        <p>
            <strong>Nilai Harapan</strong>
        </p>

        <p>
            E[S] = E[N] × E[X]
        </p>

        <p>
            E[S] =
            ${EN} × ${EX}
            =
            <strong>
                ${formatAngka(ES, 4)}
            </strong>
        </p>

        <br>

        <p>
            <strong>Variansi</strong>
        </p>

        <p>
            Var(S)
            =
            E[N]Var(X)
            +
            Var(N)(E[X])²
        </p>

        <p>
            Var(S)
            =
            (${EN})(${VarX})
            +
            (${VarN})(${EX})²
        </p>

        <p>
            =
            <strong>
                ${formatAngka(VarS, 4)}
            </strong>
        </p>
    `;


    document.getElementById(
        "hasilRandomSum"
    ).style.display = "block";

}


function resetRandomSum() {

    document.getElementById(
        "enRandom"
    ).value = 80;

    document.getElementById(
        "exRandom"
    ).value = 30;

    document.getElementById(
        "varxRandom"
    ).value = 400;

    document.getElementById(
        "hasilRandomSum"
    ).style.display = "none";

}



// =========================================
// SOAL 3
// PROSES POISSON
// =========================================

function hitungPoisson() {

    const lambda =
        Number(
            document.getElementById(
                "lambdaPoisson"
            ).value
        );


    const waktu =
        Number(
            document.getElementById(
                "waktuPoisson"
            ).value
        );


    const interval =
        Number(
            document.getElementById(
                "intervalPoisson"
            ).value
        );


    const k =
        Number(
            document.getElementById(
                "kPoisson"
            ).value
        );


    if (
        lambda < 0 ||
        waktu < 0 ||
        interval < 0 ||
        k < 0 ||
        !Number.isInteger(k)
    ) {

        alert(
            "Masukkan nilai yang valid."
        );

        return;
    }


    if (k > 170) {

        alert(
            "Nilai k terlalu besar. Gunakan k ≤ 170."
        );

        return;
    }


    const mean =
        lambda * waktu;


    const variansi =
        lambda * waktu;


    const lambdaT =
        lambda * interval;


    const probabilitas =
        (
            Math.pow(lambdaT, k) /
            faktorial(k)
        )
        *
        Math.exp(-lambdaT);


    document.getElementById(
        "hasilMean"
    ).textContent =
        formatAngka(mean, 4);


    document.getElementById(
        "hasilVariansi"
    ).textContent =
        formatAngka(variansi, 4);


    document.getElementById(
        "hasilProbabilitas"
    ).textContent =
        formatAngka(
            probabilitas,
            8
        )
        +
        " (" +
        formatAngka(
            probabilitas * 100,
            4
        )
        +
        "%)";


    document.getElementById(
        "langkahPoisson"
    ).innerHTML = `

        <p>
            <strong>Mean</strong>
        </p>

        <p>
            E[N(t)] = λt
        </p>

        <p>
            E[N(${waktu})]
            =
            ${lambda} × ${waktu}
            =
            <strong>
                ${formatAngka(mean, 4)}
            </strong>
        </p>

        <br>

        <p>
            <strong>Variansi</strong>
        </p>

        <p>
            Var[N(t)] = λt
        </p>

        <p>
            Var[N(${waktu})]
            =
            ${lambda} × ${waktu}
            =
            <strong>
                ${formatAngka(variansi, 4)}
            </strong>
        </p>

        <br>

        <p>
            <strong>Probabilitas</strong>
        </p>

        <p>
            P(N(t)=k)
            =
            ((λt)^k / k!)e^(-λt)
        </p>

        <p>
            λt =
            ${lambda} × ${interval}
            =
            ${lambdaT}
        </p>

        <p>
            P(N(${interval})=${k})
            =
            <strong>
                ${formatAngka(
                    probabilitas,
                    8
                )}
            </strong>
        </p>
    `;


    document.getElementById(
        "hasilPoisson"
    ).style.display = "block";

}


function resetPoisson() {

    document.getElementById(
        "lambdaPoisson"
    ).value = 10;

    document.getElementById(
        "waktuPoisson"
    ).value = 9;

    document.getElementById(
        "intervalPoisson"
    ).value = 0.5;

    document.getElementById(
        "kPoisson"
    ).value = 0;

    document.getElementById(
        "hasilPoisson"
    ).style.display = "none";

}



// =========================================
// SOAL 4
// ANTRIAN M/M/1
// =========================================

function hitungAntrian() {

    const waktuKedatangan =
        Number(
            document.getElementById(
                "arrivalAntrian"
            ).value
        );


    const waktuPelayanan =
        Number(
            document.getElementById(
                "serviceAntrian"
            ).value
        );


    const batas =
        Number(
            document.getElementById(
                "batasAntrian"
            ).value
        );


    if (
        waktuKedatangan <= 0 ||
        waktuPelayanan <= 0 ||
        batas <= 0
    ) {

        alert(
            "Semua waktu harus lebih besar dari 0."
        );

        return;
    }


    const lambda =
        1 / waktuKedatangan;


    const mu =
        1 / waktuPelayanan;


    const rho =
        lambda / mu;


    const status =
        document.getElementById(
            "statusAntrian"
        );


    if (rho >= 1) {

        document.getElementById(
            "hasilRho"
        ).textContent =
            formatAngka(rho, 4);


        document.getElementById(
            "hasilSibuk"
        ).textContent =
            formatAngka(
                rho * 100,
                2
            )
            +
            "%";


        document.getElementById(
            "hasilWq"
        ).textContent =
            "Tidak stabil";


        document.getElementById(
            "hasilW"
        ).textContent =
            "Tidak stabil";


        document.getElementById(
            "hasilKritis"
        ).textContent =
            "-";


        status.className =
            "status status-bahaya";


        status.textContent =
            "Sistem tidak stabil karena ρ ≥ 1. " +
            "Laju kedatangan sama dengan atau " +
            "lebih besar dari laju pelayanan.";


        document.getElementById(
            "langkahAntrian"
        ).innerHTML = `

            <p>
                λ = 1/${waktuKedatangan}
                =
                ${formatAngka(lambda, 6)}
                per menit
            </p>

            <p>
                μ = 1/${waktuPelayanan}
                =
                ${formatAngka(mu, 6)}
                per menit
            </p>

            <p>
                ρ = λ/μ
                =
                <strong>
                    ${formatAngka(rho, 4)}
                </strong>
            </p>

            <p>
                Karena ρ ≥ 1,
                sistem antrean tidak stabil.
            </p>
        `;


        document.getElementById(
            "hasilAntrian"
        ).style.display =
            "block";


        return;
    }


    const Wq =
        rho /
        (
            mu *
            (1 - rho)
        );


    const W =
        1 /
        (
            mu *
            (1 - rho)
        );


    // Batas kritis:
    // 1/(mu-lambda) = batas

    const lambdaKritis =
        mu - 1 / batas;


    let waktuKritis = null;


    if (lambdaKritis > 0) {

        waktuKritis =
            1 / lambdaKritis;

    }


    document.getElementById(
        "hasilRho"
    ).textContent =
        formatAngka(rho, 4);


    document.getElementById(
        "hasilSibuk"
    ).textContent =
        formatAngka(
            rho * 100,
            2
        )
        +
        "%";


    document.getElementById(
        "hasilWq"
    ).textContent =
        formatAngka(
            Wq,
            4
        )
        +
        " menit";


    document.getElementById(
        "hasilW"
    ).textContent =
        formatAngka(
            W,
            4
        )
        +
        " menit";


    if (waktuKritis !== null) {

        document.getElementById(
            "hasilKritis"
        ).textContent =
            formatAngka(
                waktuKritis,
                4
            )
            +
            " menit";

    } else {

        document.getElementById(
            "hasilKritis"
        ).textContent =
            "Tidak dapat ditentukan";

    }


    status.className =
        "status status-aman";


    status.textContent =
        "Sistem stabil karena ρ < 1.";


    let teksKritis = "";


    if (waktuKritis !== null) {

        teksKritis = `

            <br>

            <p>
                <strong>
                    Waktu antar-kedatangan kritis
                </strong>
            </p>

            <p>
                W =
                1 / (μ − λ)
                =
                ${batas}
            </p>

            <p>
                λ kritis =
                μ − 1/${batas}
                =
                ${formatAngka(
                    lambdaKritis,
                    6
                )}
            </p>

            <p>
                1/λ kritis =
                <strong>
                    ${formatAngka(
                        waktuKritis,
                        4
                    )}
                    menit
                </strong>
            </p>

        `;

    }


    document.getElementById(
        "langkahAntrian"
    ).innerHTML = `

        <p>
            λ =
            1/${waktuKedatangan}
            =
            ${formatAngka(lambda, 6)}
            per menit
        </p>

        <p>
            μ =
            1/${waktuPelayanan}
            =
            ${formatAngka(mu, 6)}
            per menit
        </p>

        <br>

        <p>
            <strong>
                Intensitas lalu lintas
            </strong>
        </p>

        <p>
            ρ =
            λ/μ
            =
            ${formatAngka(rho, 4)}
        </p>

        <br>

        <p>
            <strong>
                Rata-rata waktu tunggu
            </strong>
        </p>

        <p>
            Wq =
            ρ / [μ(1 − ρ)]
            =
            <strong>
                ${formatAngka(Wq, 4)}
                menit
            </strong>
        </p>

        <br>

        <p>
            <strong>
                Waktu dalam sistem
            </strong>
        </p>

        <p>
            W =
            1 / [μ(1 − ρ)]
            =
            <strong>
                ${formatAngka(W, 4)}
                menit
            </strong>
        </p>

        ${teksKritis}
    `;


    document.getElementById(
        "hasilAntrian"
    ).style.display =
        "block";

}


function resetAntrian() {

    document.getElementById(
        "arrivalAntrian"
    ).value = 25;

    document.getElementById(
        "serviceAntrian"
    ).value = 15;

    document.getElementById(
        "batasAntrian"
    ).value = 45;

    document.getElementById(
        "hasilAntrian"
    ).style.display = "none";

}



// =========================================
// SOAL 5
// MARKOV 2 STATE
// =========================================

function hitungMarkov2() {

    const p =
        Number(
            document.getElementById(
                "pMarkov2"
            ).value
        );


    const q =
        Number(
            document.getElementById(
                "qMarkov2"
            ).value
        );


    const n =
        Number(
            document.getElementById(
                "nMarkov2"
            ).value
        );


    if (
        document.getElementById(
            "pMarkov2"
        ).value === ""
        ||
        document.getElementById(
            "qMarkov2"
        ).value === ""
    ) {

        alert(
            "Masukkan nilai p dan q terlebih dahulu."
        );

        return;
    }


    if (
        p < 0 ||
        p > 1 ||
        q < 0 ||
        q > 1
    ) {

        alert(
            "Nilai p dan q harus berada antara 0 dan 1."
        );

        return;
    }


    if (p + q === 0) {

        alert(
            "p dan q tidak boleh keduanya bernilai 0."
        );

        return;
    }


    if (
        !Number.isInteger(n) ||
        n < 1
    ) {

        alert(
            "Nilai n harus berupa bilangan bulat positif."
        );

        return;
    }


    const lambda0 =
        q / (p + q);


    const lambda1 =
        p / (p + q);


    const P = [
        [1 - p, p],
        [q, 1 - q]
    ];


    // Kondisi awal telepon FREE

    let distribusi = [1, 0];


    const labels = [0];

    const freeData = [1];

    const batasGrafik =
        Math.min(n, 1000);


    for (
        let langkah = 1;
        langkah <= n;
        langkah++
    ) {

        distribusi =
            kaliVektorMatriks(
                distribusi,
                P
            );


        if (
            langkah <= batasGrafik
        ) {

            labels.push(langkah);

            freeData.push(
                distribusi[0]
            );

        }

    }


    const exactFree =
        distribusi[0];


    const approxFree =
        lambda0;


    document.getElementById(
        "hasilLambda0"
    ).textContent =
        formatAngka(lambda0, 6);


    document.getElementById(
        "hasilLambda1"
    ).textContent =
        formatAngka(lambda1, 6);


    document.getElementById(
        "hasilExactFree"
    ).textContent =
        formatAngka(
            exactFree,
            8
        );


    document.getElementById(
        "hasilApproxFree"
    ).textContent =
        formatAngka(
            approxFree,
            8
        );


    document.getElementById(
        "langkahMarkov2"
    ).innerHTML = `

        <p>
            Matriks transisi:
        </p>

        <p>
            P =
            [[${formatAngka(1-p, 4)},
            ${formatAngka(p, 4)}],
            [${formatAngka(q, 4)},
            ${formatAngka(1-q, 4)}]]
        </p>

        <br>

        <p>
            Distribusi invarian memenuhi:
            λ = λP
        </p>

        <p>
            λ₀ =
            q / (p + q)
        </p>

        <p>
            λ₀ =
            ${q} /
            (${p} + ${q})
            =
            <strong>
                ${formatAngka(lambda0, 6)}
            </strong>
        </p>

        <p>
            λ₁ =
            p / (p + q)
            =
            <strong>
                ${formatAngka(lambda1, 6)}
            </strong>
        </p>

        <br>

        <p>
            Karena state awal adalah Free:
        </p>

        <p>
            α = (1, 0)
        </p>

        <p>
            α⁽ⁿ⁾ = αPⁿ
        </p>

        <p>
            Untuk n = ${n},
            hasil komputasi:
        </p>

        <p>
            P(X${n} = Free)
            =
            <strong>
                ${formatAngka(
                    exactFree,
                    8
                )}
            </strong>
        </p>

        <p>
            Sedangkan pendekatan
            jangka panjang:
        </p>

        <p>
            P(X${n} = Free)
            ≈
            λ₀
            =
            <strong>
                ${formatAngka(
                    approxFree,
                    8
                )}
            </strong>
        </p>

        <p>
            Semakin besar n,
            kedua nilai akan semakin mendekati
            satu sama lain.
        </p>
    `;


    if (chartMarkov2Obj) {
        chartMarkov2Obj.destroy();
    }


    chartMarkov2Obj =
        new Chart(
            document.getElementById(
                "chartMarkov2"
            ),
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label:
                                "P(Xn = Free)",

                            data:
                                freeData,

                            pointRadius: 0
                        },

                        {
                            label:
                                "λ₀",

                            data:
                                labels.map(
                                    () => lambda0
                                ),

                            pointRadius: 0,

                            borderDash:
                                [6, 6]
                        }

                    ]
                },

                options: {

                    responsive: true,

                    scales: {

                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }

            }
        );


    document.getElementById(
        "hasilMarkov2"
    ).style.display =
        "block";

}