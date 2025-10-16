'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    TrendingUp,
    Shield,
    Calendar,
    IndianRupee,
    ArrowRight
} from 'lucide-react';
import axios from 'axios';


const riskOptions = [
    {
        value: 'conservative',
        label: 'Conservative',
        description: 'Preserve capital, minimal risk',
        icon: <Shield className="w-4 h-4" />
    },
    {
        value: 'moderate',
        label: 'Moderate',
        description: 'Balanced growth with managed risk',
        icon: <Target className="w-4 h-4" />
    },
    {
        value: 'aggressive',
        label: 'Aggressive',
        description: 'High growth potential, higher risk',
        icon: <TrendingUp className="w-4 h-4" />
    }
];

const investmentGoals = [
    { value: 'growth', label: 'Capital Growth', desc: 'Build wealth over time' },
    { value: 'income', label: 'Regular Income', desc: 'Steady dividend income' },
    { value: 'balanced', label: 'Growth + Income', desc: 'Mix of growth and dividends' },
    { value: 'preservation', label: 'Capital Preservation', desc: 'Protect existing wealth' }
];

const sectorOptions = [
    'Technology', 'Banking', 'Healthcare', 'FMCG',
    'Energy', 'Auto', 'Pharma', 'Telecom'
];


export default function UserProfileSetup() {
    const router = useRouter();

    const [profile, setProfile] = useState({
        riskTolerance: '',
        investmentGoal: '',
        timeHorizon: [],
        cashBalance: '',
        monthlyInvestment: '',
        experience: '',
        sectors: [],
        notes: ''
    });

    const [fetchedProfile, setFetchedProfile] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const resp = await axios.get("/api/profile-status", { withCredentials: true });
                if (resp?.data) {
                    setProfileCompleted(Boolean(resp.data.profileCompleted));
                    if (resp.data.profile && typeof resp.data.profile === 'object') {
                        const p = resp.data.profile;
                        setFetchedProfile(p);
                        setProfile(prev => ({
                            ...prev,
                            riskTolerance: p.riskTolerance ?? prev.riskTolerance,
                            investmentGoal: p.investmentGoal ?? prev.investmentGoal,
                            timeHorizon: Array.isArray(p.timeHorizon)
                                ? p.timeHorizon
                                : [Number(p.timeHorizon) || prev.timeHorizon[0]],
                            cashBalance: p.cashBalance != null ? String(p.cashBalance) : prev.cashBalance,
                            monthlyInvestment: p.monthlyInvestment != null ? String(p.monthlyInvestment) : prev.monthlyInvestment,
                            experience: p.experience ?? prev.experience,
                            sectors: Array.isArray(p.sectors) ? p.sectors : prev.sectors,
                            notes: p.notes ?? prev.notes
                        }));
                        if (p.updatedAt) {
                            setLastUpdated(new Date(p.lastCashBalanceUpdateDate));
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const handleSectorToggle = (sector) => {
        setProfile(prev => ({
            ...prev,
            sectors: prev.sectors.includes(sector)
                ? prev.sectors.filter(s => s !== sector)
                : [...prev.sectors, sector]
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const normalized = {
                riskTolerance: profile.riskTolerance ?? fetchedProfile?.riskTolerance ?? 'moderate',
                investmentGoal: profile.investmentGoal ?? fetchedProfile?.investmentGoal ?? 'growth',
                timeHorizon: (() => {
                    const v = Array.isArray(profile.timeHorizon) ? profile.timeHorizon[0] : Number(profile.timeHorizon);
                    if (Number.isFinite(v) && v >= 1) return v;
                    const fp = fetchedProfile?.timeHorizon;
                    if (Array.isArray(fp)) return fp[0];
                    if (Number.isFinite(Number(fp))) return Number(fp);
                    return 5;
                })(),
                cashBalance: (() => {
                    if (profile.cashBalance !== '' && profile.cashBalance != null) {
                        const n = Number(profile.cashBalance);
                        if (Number.isFinite(n)) return n;
                    }
                    if (fetchedProfile && fetchedProfile.cashBalance != null) return Number(fetchedProfile.cashBalance);
                    return 0;
                })(),
                monthlyInvestment: (() => {
                    if (profile.monthlyInvestment !== '' && profile.monthlyInvestment != null) {
                        const n = Number(profile.monthlyInvestment);
                        if (Number.isFinite(n)) return n;
                    }
                    if (fetchedProfile && fetchedProfile.monthlyInvestment != null) return Number(fetchedProfile.monthlyInvestment);
                    return 0;
                })(),
                experience: profile.experience ?? fetchedProfile?.experience ?? 'intermediate',
                sectors: Array.isArray(profile.sectors) && profile.sectors.length > 0
                    ? profile.sectors
                    : (Array.isArray(fetchedProfile?.sectors) ? fetchedProfile.sectors : []),
                notes: profile.notes ?? fetchedProfile?.notes ?? ''
            };

            if (!normalized.riskTolerance) throw new Error('Please select a risk tolerance.');
            if (!normalized.investmentGoal) throw new Error('Please select an investment goal.');
            if (!Number.isFinite(normalized.timeHorizon) || normalized.timeHorizon < 1) throw new Error('Please select a valid time horizon.');

            const resp = await axios.patch('/api/update-investment-profile', normalized, { withCredentials: true });

            if (resp?.data?.ok === false) {
                const msg = resp.data.error || 'Failed to update profile';
                throw new Error(msg);
            }

            console.log('Profile update response:', resp.data);
            setProfileCompleted(true);

            if (resp?.data?.profile) {
                const p = resp.data.profile;
                setFetchedProfile(p);
                setProfile(prev => ({
                    ...prev,
                    riskTolerance: p.riskTolerance ?? prev.riskTolerance,
                    investmentGoal: p.investmentGoal ?? prev.investmentGoal,
                    timeHorizon: Array.isArray(p.timeHorizon) ? p.timeHorizon : [Number(p.timeHorizon) || prev.timeHorizon[0]],
                    cashBalance: p.cashBalance != null ? String(p.cashBalance) : prev.cashBalance,
                    monthlyInvestment: p.monthlyInvestment != null ? String(p.monthlyInvestment) : prev.monthlyInvestment,
                    experience: p.experience ?? prev.experience,
                    sectors: Array.isArray(p.sectors) ? p.sectors : prev.sectors,
                    notes: p.notes ?? prev.notes,
                }));

                setLastUpdated(new Date(p.lastCashBalanceUpdateDate));
            }

            alert('Profile updated successfully.');
            setTimeout(() => router.push('/dashboard'), 400);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError(err?.message || 'Failed to update profile. Please try again.');
            alert(err?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{profileCompleted ? "Update" : "Set Up"} Your Investment Profile</h1>
                <p className="text-muted-foreground">
                    Help us personalize your portfolio recommendations and insights
                </p>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                        {isLoading ? 'Loading…' : `Last updated: ${lastUpdated?.toLocaleTimeString()}`}
                    </Badge>
                </div>
                {isLoading && <p className="text-sm text-muted-foreground mt-2">Loading profile…</p>}
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Tolerance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Risk Tolerance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={profile.riskTolerance}
                            onValueChange={(value) => setProfile({ ...profile, riskTolerance: value })}
                        >
                            {riskOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent">
                                    <RadioGroupItem value={option.value} id={option.value} />
                                    <div className="flex items-center gap-2 flex-1">
                                        {option.icon}
                                        <div>
                                            <Label htmlFor={option.value} className="font-medium">
                                                {option.label}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Investment Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Investment Goal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={profile.investmentGoal}
                            onValueChange={(value) => setProfile({ ...profile, investmentGoal: value })}
                        >
                            {investmentGoals.map((goal) => (
                                <div key={goal.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent">
                                    <RadioGroupItem value={goal.value} id={goal.value} />
                                    <div className="flex-1">
                                        <Label htmlFor={goal.value} className="font-medium">
                                            {goal.label}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {goal.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Time Horizon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Investment Time Horizon
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="px-2">
                            <Slider
                                value={Array.isArray(profile.timeHorizon) ? profile.timeHorizon : [Number(profile.timeHorizon) || 5]}
                                onValueChange={(value) => setProfile({ ...profile, timeHorizon: value })}
                                max={20}
                                min={1}
                                step={1}
                                className="w-full"
                            />
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold">{(Array.isArray(profile.timeHorizon) ? profile.timeHorizon[0] : Number(profile.timeHorizon) || 5)}</span>
                            <span className="text-muted-foreground ml-1">
                                {(Array.isArray(profile.timeHorizon) ? profile.timeHorizon[0] : Number(profile.timeHorizon) || 5) === 1 ? 'year' : 'years'}
                            </span>
                        </div>
                    </CardContent>

                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                                <Badge
                                    key={lvl}
                                    variant={profile.experience === lvl ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setProfile(prev => ({ ...prev, experience: lvl }))}
                                >
                                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IndianRupee className="w-5 h-5" />
                            Financial Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="cashBalance" className={"mb-2"}>Available Cash Balance</Label>
                            <Input
                                id="cashBalance"
                                type="number"
                                placeholder="Enter amount in ₹"
                                value={profile.cashBalance}
                                onChange={(e) => setProfile({ ...profile, cashBalance: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Cash available for new investments
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="monthlyInvestment" className={"mb-2"}>Monthly Investment Capacity</Label>
                            <Input
                                id="monthlyInvestment"
                                type="number"
                                placeholder="Monthly amount in ₹"
                                value={profile.monthlyInvestment}
                                onChange={(e) => setProfile({ ...profile, monthlyInvestment: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sector Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Sector Preferences (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {sectorOptions.map((sector) => (
                            <Badge
                                key={sector}
                                variant={profile.sectors.includes(sector) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleSectorToggle(sector)}
                            >
                                {sector}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Any specific investment preferences, constraints, or goals..."
                        value={profile.notes}
                        onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit} className="flex items-center gap-2" disabled={isLoading || isSubmitting}>
                    {profileCompleted ? "Update" : "Complete"} Profile Setup
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
